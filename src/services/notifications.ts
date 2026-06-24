import api from "./api";
import type { NotificationResponse, PagedResponse } from "../lib/types";

const BASE = "/api/v1/notifications";

// ---------------------------------------------------------------------------
// Get paginated notifications (newest first)
// ---------------------------------------------------------------------------
export async function getNotifications(
  page = 0,
  size = 10
): Promise<PagedResponse<NotificationResponse>> {
  const res = await api.get(`${BASE}`, {
    params: { page, size },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Mark a single notification as read
// ---------------------------------------------------------------------------
export async function markNotificationRead(notificationId: string): Promise<void> {
  await api.put(`${BASE}/mark-read/${notificationId}`);
}

// ---------------------------------------------------------------------------
// Deep-link helper
// Maps notificationType + referenceId to the correct in-app route.
// Use in the notification list: router.push(buildNotificationLink(n.referenceType, n.referenceId))
// ---------------------------------------------------------------------------
export function buildNotificationLink(
  referenceType: string | undefined,
  referenceId: string | undefined
): string {
  if (!referenceType || !referenceId) return "/notifications";

  switch (referenceType) {
    case "NEW_POST":
    case "GOOD_QUESTION":
    case "NEW_ANSWER":
    case "ANSWER_ACCEPTED":
    case "UPVOTE":
      return `/posts/${referenceId}`;
    case "NEW_MATERIAL":
      return `/materials/${referenceId}`;
    default:
      return "/notifications";
  }
}

// ---------------------------------------------------------------------------
// Derive unread count from a fetched page of notifications.
// Use this when a separate badge-count endpoint is not yet available.
// ---------------------------------------------------------------------------
export function countUnread(notifications: NotificationResponse[]): number {
  return notifications.filter((n) => !n.isRead).length;
}