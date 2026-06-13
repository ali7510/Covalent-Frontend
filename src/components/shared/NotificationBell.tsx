import { useUnreadCount } from "@/hooks/useNotifications"

export default function NotificationBell() {
  const unreadCount = useUnreadCount()

  if (unreadCount === 0) return null

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[11px] font-medium flex items-center justify-center px-1 shadow-sm shrink-0">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )
}
