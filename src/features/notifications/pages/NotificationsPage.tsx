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
          <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
            Your <span className="font-[510]">Notifications</span>
          </h1>
          <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
            Stay updated with peer discussions, recently shared study materials, and academic achievements.
          </p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="self-start sm:self-center inline-flex items-center space-x-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-[510] text-foreground hover:bg-secondary active:scale-98 transition-all"
        >
          <Check className="h-4 w-4" />
          <span>Mark page as read</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center space-x-2 border-b border-border pb-3">
        <button
          onClick={() => {
            setActiveTab("all")
            setPageNumber(0)
          }}
          className={`px-4 py-1.5 rounded-md text-[12px] font-[510] transition-all duration-200 ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Notifications ({page?.totalElements ?? notifications.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("unread")
            setPageNumber(0)
          }}
          className={`px-4 py-1.5 rounded-md text-[12px] font-[510] transition-all duration-200 ${
            activeTab === "unread"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-md border border-border bg-card overflow-hidden shadow-card-light dark:shadow-card-dark">
        {isLoading ? (
          <LoadingState message="Loading notifications…" />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6 text-muted-foreground" />}
            title="No notifications found"
            description="Everything caught up and active!"
          />
        ) : (
          <div className="divide-y divide-border">
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
                      ? "bg-card hover:bg-secondary/20" 
                      : "bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon Column */}
                    <div className={`p-2.5 rounded-md border ${
                      notif.isRead
                        ? "bg-secondary border-border text-muted-foreground"
                        : "bg-card border-border text-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Message Column */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-[12px] font-[510] leading-none ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground font-normal leading-relaxed max-w-xl">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground block pt-0.5">{timeAgo}</span>
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
        <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[12px] font-[510]">
          <button
            onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
            disabled={pageNumber === 0}
            className="px-3.5 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <span className="text-muted-foreground font-normal">
            Page {pageNumber + 1} of {page.totalPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => p + 1)}
            disabled={pageNumber + 1 >= page.totalPages}
            className="px-3.5 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
