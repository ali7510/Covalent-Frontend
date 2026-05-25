import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check, MessageSquare, BookOpen, Trophy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import { useNotifications, useUnreadCount } from "@/hooks/useNotifications"
import { markNotificationRead, buildNotificationLink } from "@/services/notifications"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import type { NotificationResponse } from "@/lib/types"

const ICON_MAP: Record<string, React.ElementType> = {
  ANSWER_POSTED: MessageSquare,
  GOOD_QUESTION: Trophy,
  MATERIAL_UPLOADED: BookOpen,
  POST_CREATED: MessageSquare,
  UPVOTE_RECEIVED: Trophy,
  DEFAULT: Bell,
}

function getIcon(type: string) {
  return ICON_MAP[type] || ICON_MAP.DEFAULT
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [pageNumber, setPageNumber] = useState(0)
  const pageSize = 15

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: page, isLoading } = useNotifications(pageNumber, pageSize)
  const notifications = page?.content || []
  
  // Get active unread count from the polling hook to keep it accurate
  const unreadCount = useUnreadCount()

  const filteredNotifications = activeTab === "unread"
    ? notifications.filter(n => !n.isRead)
    : notifications

  const handleClick = async (notif: NotificationResponse) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif.id)
        // Invalidate both notifications and unread-count keys
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
      } catch {
        // silent fail
      }
    }
    const link = buildNotificationLink(notif.referenceType, notif.referenceId)
    // Fix: check that the link is not a dead link or points back to notifications itself
    if (link && link !== "#" && link !== "/notifications") {
      navigate(link)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    if (unread.length === 0) return

    try {
      await Promise.all(unread.map(n => markNotificationRead(n.id)))
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    } catch {
      // silent fail
    }
  }

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
            Your <span className="font-semibold">Notifications</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-455 font-light max-w-2xl text-sm leading-relaxed">
            Stay updated with peer discussions, recently shared study materials, and academic achievements.
          </p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="self-start sm:self-center inline-flex items-center space-x-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-350 hover:bg-neutral-55 dark:hover:bg-neutral-900 active:scale-98 transition-all"
        >
          <Check className="h-4 w-4" />
          <span>Mark page as read</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => {
            setActiveTab("all")
            setPageNumber(0)
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === "all"
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
              : "text-neutral-550 hover:text-neutral-900 dark:text-neutral-450 dark:hover:text-neutral-250"
          }`}
        >
          All Notifications ({page?.totalElements ?? notifications.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("unread")
            setPageNumber(0)
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === "unread"
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
              : "text-neutral-550 hover:text-neutral-900 dark:text-neutral-450 dark:hover:text-neutral-250"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingState message="Loading notifications…" />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6 text-neutral-400" />}
            title="No notifications found"
            description="Everything caught up and active!"
          />
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {filteredNotifications.map((notif) => {
              const Icon = getIcon(notif.notificationType)
              const timeAgo = (() => {
                try {
                  return formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                } catch {
                  return notif.createdAt || "N/A"
                }
              })()

              return (
                <div 
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`flex items-start justify-between p-5 cursor-pointer transition-colors duration-150 ${
                    notif.isRead 
                      ? "bg-white dark:bg-neutral-950 hover:bg-neutral-50/30 dark:hover:bg-neutral-900/5" 
                      : "bg-neutral-50/50 dark:bg-neutral-900/10 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/15"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon Column */}
                    <div className={`p-2.5 rounded-lg border ${
                      notif.isRead
                        ? "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-450 dark:text-neutral-500"
                        : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
                    }`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    {/* Message Column */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-xs font-semibold leading-none ${notif.isRead ? "text-neutral-850 dark:text-neutral-300" : "text-neutral-950 dark:text-white"}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-450 font-light leading-relaxed max-w-xl">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block pt-0.5">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-4 mt-4 text-xs font-semibold">
          <button
            onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
            disabled={pageNumber === 0}
            className="px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Previous
          </button>
          <span className="text-neutral-450 font-normal">
            Page {pageNumber + 1} of {page.totalPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => p + 1)}
            disabled={pageNumber + 1 >= page.totalPages}
            className="px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
