import { useUnreadCount } from "@/hooks/useNotifications"

export default function NotificationBell() {
  const unreadCount = useUnreadCount()

  if (unreadCount === 0) return null

  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-[9px] font-bold px-1.5 shadow-xs shrink-0">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )
}
