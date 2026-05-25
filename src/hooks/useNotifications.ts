import { useQuery } from "@tanstack/react-query"
import { getNotifications, countUnread } from "@/services/notifications"
import type { NotificationResponse, PagedResponse } from "@/lib/types"

export function useNotifications(page = 0, size = 20) {
  return useQuery<PagedResponse<NotificationResponse>, Error>({
    queryKey: ["notifications", page, size],
    queryFn: () => getNotifications(page, size),
    staleTime: 10000, // notifications are stale after 10s
  })
}

export function useUnreadCount() {
  const { data } = useQuery<PagedResponse<NotificationResponse>, Error>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getNotifications(0, 100),
    refetchInterval: 15000, // Poll every 15 seconds for new notification counts
    staleTime: 5000,
  })
  return data?.content ? countUnread(data.content) : 0
}
