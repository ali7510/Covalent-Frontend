import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token
// ---------------------------------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — silent token refresh on 401
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = original.url || "";

    // Define public endpoints that should NEVER trigger token refresh
    const isPublicEndpoint = 
      url.includes("/api/v1/auth/login") ||
      url.includes("/api/v1/auth/register") ||
      url.includes("/api/v1/auth/forgot-password") ||
      url.includes("/api/v1/auth/reset-password");

    // Only handle 401 errors, skip if already retried, or if it's a public endpoint
    if (
      status !== 401 ||
      original._retry ||
      isPublicEndpoint
    ) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Use plain axios — NOT the `api` instance — to avoid recursive interception
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api/v1/auth/refresh`,
        { refreshToken }
      );

      const { token: newAccess, refreshToken: newRefresh } = data.data;
      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("refreshToken", newRefresh);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      original.headers.Authorization = `Bearer ${newAccess}`;

      processQueue(null, newAccess);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;