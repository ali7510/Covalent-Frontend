import { ArrowUp, CornerDownRight, CheckCircle2, User, Check, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { AnswerResponse } from "@/lib/types"
import { useState } from "react"
import { toast } from "sonner"

interface AnswerCardProps {
  answer: AnswerResponse
  isPostAuthor?: boolean
  isAnswerAuthor?: boolean
  onAccept?: (answerId: string) => void
  onUnaccept?: () => void
  onUpvoteToggle?: (answerId: string, hasUpvoted: boolean) => void
  onEdit?: (answer: AnswerResponse) => void
  onDelete?: (answerId: string) => void
}

export default function AnswerCard({
  answer,
  isPostAuthor = false,
  isAnswerAuthor = false,
  onAccept,
  onUnaccept,
  onUpvoteToggle,
  onEdit,
  onDelete,
}: AnswerCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(() => {
    const voted = localStorage.getItem("votedAnswers")
    if (!voted) return false
    try {
      const ids = JSON.parse(voted) as string[]
      return ids.includes(answer.id)
    } catch {
      return false
    }
  })

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })
    } catch {
      return answer.createdAt || "N/A"
    }
  })()

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAnswerAuthor) {
      toast.error("You cannot upvote your own answer!")
      return
    }
    if (onUpvoteToggle) {
      onUpvoteToggle(answer.id, hasUpvoted)
      const next = !hasUpvoted
      setHasUpvoted(next)
      
      const voted = localStorage.getItem("votedAnswers")
      try {
        const ids = voted ? (JSON.parse(voted) as string[]) : []
        if (next) {
          if (!ids.includes(answer.id)) {
            ids.push(answer.id)
          }
        } else {
          const filtered = ids.filter((id) => id !== answer.id)
          localStorage.setItem("votedAnswers", JSON.stringify(filtered))
          return
        }
        localStorage.setItem("votedAnswers", JSON.stringify(ids))
      } catch {
        // ignore
      }
    }
  }

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!onAccept || !onUnaccept) return

    if (answer.isAccepted) {
      onUnaccept()
    } else {
      onAccept(answer.id)
    }
  }

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs flex items-start space-x-4 transition-all duration-200 ${
        answer.isAccepted
          ? "bg-neutral-50/50 dark:bg-neutral-900/10 border-neutral-300 dark:border-neutral-800"
          : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
      }`}
    >
      {/* Accept / reply indicator */}
      <div className="mt-1">
        {answer.isAccepted ? (
          <CheckCircle2 className="h-5 w-5 text-neutral-850 dark:text-neutral-200" />
        ) : (
          <CornerDownRight className="h-4 w-4 text-neutral-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-850 dark:text-neutral-200 flex items-center space-x-1">
            <User className="h-3 w-3 text-neutral-400" />
            <span>{answer.authorName || "N/A"}</span>
            {answer.isAccepted && (
              <span className="ml-2 text-[9px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                Accepted Answer
              </span>
            )}
          </span>
          <span className="text-[10px] text-neutral-450 dark:text-neutral-555">{timeAgo}</span>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-455 leading-relaxed font-light whitespace-pre-wrap">
          {answer.body}
        </p>

        {/* Action Panel: Upvoting and Verifying Answer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 mt-2">
          {/* Upvote Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center space-x-1 p-1 px-2.5 rounded-lg border text-[10px] font-semibold transition-all duration-200 ${
                hasUpvoted
                  ? "bg-neutral-950 text-white border-neutral-950 dark:bg-white dark:text-neutral-950 dark:border-white"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-850"
              }`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>{answer.upvoteCount + (hasUpvoted ? 1 : 0)} Upvotes</span>
            </button>

            {isAnswerAuthor && (
              <div className="flex items-center space-x-1.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-3">
                <button
                  onClick={() => onEdit?.(answer)}
                  className="p-1 rounded-lg border border-neutral-250 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  title="Edit Answer"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete?.(answer.id)}
                  className="p-1 rounded-lg border border-red-200 dark:border-red-900/50 text-red-505 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete Answer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Accept / Unaccept trigger (Original Post Author only) */}
          {isPostAuthor && (
            <button
              onClick={handleAccept}
              className={`flex items-center space-x-1.5 p-1 px-3 rounded-lg border text-[10px] font-semibold active:scale-98 transition-all ${
                answer.isAccepted
                  ? "bg-red-50 text-red-650 border-red-200 hover:bg-red-100"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-850"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{answer.isAccepted ? "Unverify Answer" : "Verify Answer"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
