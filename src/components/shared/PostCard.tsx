import { Link } from "react-router-dom"
import { ArrowUp, MessageSquare, User, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { AllPostsResponse } from "@/lib/types"

interface PostCardProps {
  post: AllPostsResponse
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    } catch {
      return post.createdAt || "N/A"
    }
  })()

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-xs flex items-start space-x-4 hover:shadow-md transition-shadow duration-200">
      {/* Vote count badge */}
      <div className="flex flex-col items-center space-y-1 p-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 rounded-lg shrink-0">
        <ArrowUp className="h-4 w-4 text-neutral-400" />
        <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">{post.goodQuestionCount}</span>
      </div>

      <div className="flex-1 space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              to={`/posts/${post.postId}`}
              className="text-xs font-semibold text-neutral-900 dark:text-white leading-snug hover:underline"
            >
              {post.title}
            </Link>
            {post.solved && (
              <span className="inline-flex items-center rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[9px] font-semibold text-neutral-600 dark:text-neutral-400">
                Solved
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-550 dark:text-neutral-450 leading-relaxed font-light line-clamp-2">
            {post.body}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-450 dark:text-neutral-500 font-medium pt-1 border-t border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>By {post.authorName || "N/A"}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{post.answerCount} Answers</span>
          </span>
        </div>
      </div>
    </div>
  )
}
