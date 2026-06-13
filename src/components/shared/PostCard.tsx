import { Link } from "react-router-dom"
import { ThumbsUp, MessageSquare, Eye, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { AllPostsResponse } from "@/lib/types"
import UserAvatar from "./UserAvatar"

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
    <div className="bg-card border border-border rounded-md shadow-card-light dark:shadow-card-dark pt-6 px-6 pb-7 hover:border-primary/30 transition-all duration-150 flex flex-col justify-between">
      {/* Top Row: Author details & Solved badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserAvatar className="h-6 w-6 ring-1 ring-border" fallbackClassName="text-[10px]" />
          <div className="flex items-center space-x-1.5 text-[13px] leading-[18px] text-muted-foreground font-normal">
            <span className="font-medium text-foreground">{post.authorName || "Anonymous"}</span>
            <span>•</span>
            <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{timeAgo}</span>
          </div>
        </div>
        
        {post.solved && (
          <span className="rounded-full text-[13px] font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Solved
          </span>
        )}
      </div>

      {/* Middle Row: Title and Body */}
      <div className="space-y-2 mb-5">
        <h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground hover:underline">
          <Link to={`/posts/${post.postId}`}>{post.title}</Link>
        </h3>
        <p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal text-muted-foreground line-clamp-3">
          {post.body}
        </p>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          {/* Good Q Badge/Button */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
            post.hasVoted
              ? "text-primary bg-primary/8"
              : "text-muted-foreground hover:bg-muted"
          }`}>
            <ThumbsUp className={`h-4.5 w-4.5 ${post.hasVoted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            <span>Good Q ({post.goodQuestionCount})</span>
          </div>

          {/* Views Count */}
          <div className="flex items-center space-x-1.5 text-[13px] font-medium text-muted-foreground">
            <Eye className="h-4.5 w-4.5" />
            <span>{post.viewCount} Views</span>
          </div>
        </div>

        {/* Answer Count */}
        <Link to={`/posts/${post.postId}`} className="flex items-center space-x-1.5 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">
          <MessageSquare className="h-4.5 w-4.5" />
          <span>{post.answerCount} Answers</span>
        </Link>
      </div>

      {/* Top 3 Answer Previews inline */}
      {post.top3Answers && post.top3Answers.length > 0 && (
        <div className="border-t border-border pt-4 mt-4 space-y-2">
          {post.top3Answers.slice(0, 3).map((ans) => (
            <div key={ans.answerId} className="flex items-start space-x-2 text-[13px] leading-[18px]">
              <span className="font-medium text-foreground shrink-0">{ans.authorName}:</span>
              <p className="text-muted-foreground line-clamp-1">{ans.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
