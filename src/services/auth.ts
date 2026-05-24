import api from "./api";
import type {
  AuthResponse,
  RegisterResponse,
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "../lib/types";

const BASE = "/api/v1/auth";

// ---------------------------------------------------------------------------
// Register a new account
// ---------------------------------------------------------------------------
export async function register(body: RegisterBody): Promise<RegisterResponse> {
  const res = await api.post(`${BASE}/register`, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Login — stores tokens in localStorage on success
// ---------------------------------------------------------------------------
export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await api.post(`${BASE}/login`, body);
  const auth: AuthResponse = res.data.data;
  localStorage.setItem("accessToken", auth.token);
  localStorage.setItem("refreshToken", auth.refreshToken);
  return auth;
}

// ---------------------------------------------------------------------------
// Refresh token pair (called automatically by the Axios interceptor;
// exposed here in case you need to call it manually)
// ---------------------------------------------------------------------------
export async function refreshTokens(): Promise<AuthResponse> {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await api.post(`${BASE}/refresh`, { refreshToken });
  const auth: AuthResponse = res.data.data;
  localStorage.setItem("accessToken", auth.token);
  localStorage.setItem("refreshToken", auth.refreshToken);
  return auth;
}

// ---------------------------------------------------------------------------
// Forgot password — always 200, no enumeration
// ---------------------------------------------------------------------------
export async function forgotPassword(body: ForgotPasswordBody): Promise<void> {
  await api.post(`${BASE}/forgot-password`, body);
}

// ---------------------------------------------------------------------------
// Reset password using the emailed token
// ---------------------------------------------------------------------------
export async function resetPassword(body: ResetPasswordBody): Promise<void> {
  await api.post(`${BASE}/reset-password`, body);
}

// ---------------------------------------------------------------------------
// Logout from every device
// ---------------------------------------------------------------------------
export async function logoutAll(): Promise<void> {
  await api.post(`${BASE}/logout-all`);
  localStorage.clear();
}