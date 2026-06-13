import { ArrowUp, Check, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { AnswerResponse } from "@/lib/types"
import { toast } from "sonner"
import UserAvatar from "./UserAvatar"

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
  const hasUpvoted = answer.hasUpvoted ?? false

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
      className={`rounded-md border p-6 flex flex-col justify-between shadow-card-light dark:shadow-card-dark transition-all duration-200 ${
        answer.isAccepted
          ? "border-l-[3px] border-l-primary border-t-border border-r-border border-b-border bg-card"
          : "border-border bg-card"
      }`}
    >
      {/* Top Row: Author details & Accepted Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserAvatar className="h-6 w-6 ring-1 ring-border" fallbackClassName="text-[10px]" />
          <div className="flex items-center space-x-1.5 text-[13px] leading-[18px] text-muted-foreground font-normal">
            <span className="font-medium text-foreground">{answer.authorName || "Anonymous"}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
        
        {answer.isAccepted && (
          <span className="rounded-md bg-primary/10 text-primary dark:bg-primary/20 text-[13px] font-medium px-2 py-0.5">
            Accepted
          </span>
        )}
      </div>

      {/* Answer Body */}
      <div className="mb-5">
        <p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal text-foreground whitespace-pre-wrap">
          {answer.body}
        </p>
      </div>

      {/* Action panel (Bottom row) */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="flex items-center space-x-2">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              hasUpvoted
                ? "text-primary bg-primary/8"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <ArrowUp className={`h-4.5 w-4.5 mr-1 ${hasUpvoted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            <span>{answer.upvoteCount} Upvotes</span>
          </button>

          {/* Edit/Delete options for author */}
          {isAnswerAuthor && (
            <div className="flex items-center space-x-1.5 ml-2 border-l border-border pl-3">
              <button
                onClick={() => onEdit?.(answer)}
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Edit Answer"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete?.(answer.id)}
                className="p-2 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Delete Answer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Accept/Unaccept Action (Visible to post author only) */}
        {isPostAuthor && (
          <button
            onClick={handleAccept}
            className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              answer.isAccepted
                ? "text-destructive hover:bg-destructive/10"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Check className="h-4 w-4 mr-1" />
            <span>{answer.isAccepted ? "Unverify Answer" : "Verify Answer"}</span>
          </button>
        )}
      </div>
    </div>
  )
}
