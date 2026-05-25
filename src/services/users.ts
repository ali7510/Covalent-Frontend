import api from "./api";
import type { UserResponse, UpdateProfileBody, ChangePasswordBody } from "../lib/types";

const BASE = "/api/v1/users";

// ---------------------------------------------------------------------------
// Get the authenticated user's profile
// ---------------------------------------------------------------------------
export async function getProfile(): Promise<UserResponse> {
  const res = await api.get(`${BASE}/profile`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Partial update of the authenticated user's profile
// ---------------------------------------------------------------------------
export async function updateProfile(body: UpdateProfileBody): Promise<UserResponse> {
  const res = await api.patch(`${BASE}/profile`, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Change password (requires current password for verification)
// ---------------------------------------------------------------------------
export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await api.post(`${BASE}/change-password`, body);
}

// ---------------------------------------------------------------------------
// Logout from the current device
// Sends the refreshToken in the request body as required by the backend
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");
  await api.post(`${BASE}/logout`, { refreshToken });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// ---------------------------------------------------------------------------
// Notification preference toggles
// ---------------------------------------------------------------------------
export async function toggleEmailNotifications(): Promise<void> {
  await api.put("/api/v1/notifications/toggle-email");
}

export async function toggleInAppNotifications(): Promise<void> {
  await api.put("/api/v1/notifications/toggle-inapp");
}