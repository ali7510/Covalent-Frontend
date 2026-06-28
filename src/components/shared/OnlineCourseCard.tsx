import { ExternalLink, Star, Sparkles } from "lucide-react"
import type { OnlineCourseResponse } from "@/lib/types"

interface OnlineCourseCardProps {
  course: OnlineCourseResponse
}

function getPlatformBadgeStyles(source: string) {
  const src = source.toLowerCase()
  if (src === "coursera") {
    return "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800"
  }
  if (src === "udemy") {
    return "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800"
  }
  if (src === "edx") {
    return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800"
  }
  return "text-muted-foreground bg-muted border-border"
}

export default function OnlineCourseCard({ course }: OnlineCourseCardProps) {
  const score = course.score ?? 0
  const matchPercentage = Math.round(score * 100)
  
  const hasPrice = course.price !== null && course.price !== undefined
  const isFree = hasPrice && course.price === 0

  const hasRating = course.rating !== null && course.rating !== undefined
  const hasReviews = course.reviews !== null && course.reviews !== undefined

  return (
    <div className="bg-card border border-border rounded-md shadow-card-light dark:shadow-card-dark p-5 hover:border-primary/30 transition-all duration-150 flex flex-col gap-4 relative overflow-hidden group">
      {/* Glow Highlight for High Score Recommendations */}
      {score >= 0.9 && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Top row: Platform Source & Match Score */}
      <div className="flex items-center justify-between gap-3">
        <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-[510] tracking-wide uppercase ${getPlatformBadgeStyles(course.source)}`}>
          {course.source}
        </span>
        
        {/* Recommendation Score Badge */}
        <span className="inline-flex items-center gap-1 text-[11px] font-[510] text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-full px-2 py-0.5">
          <Sparkles className="h-3 w-3 animate-pulse text-emerald-500 dark:text-emerald-400" />
          <span>{matchPercentage}% Match</span>
        </span>
      </div>

      {/* Main Info */}
      <div className="space-y-1.5 flex-1">
        <h4 className="text-[15px] font-[510] text-foreground leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h4>
        <p className="text-[13px] text-muted-foreground font-normal leading-relaxed line-clamp-2">
          {course.description}
        </p>
      </div>

      {/* Academic Course Mapping Badge */}
      <div className="inline-flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground bg-secondary/50 dark:bg-secondary/20 rounded-md px-2.5 py-1 w-fit border border-border/50">
        <span className="font-[510] text-foreground">{course.courseCode}</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span className="truncate max-w-[150px]">{course.courseName}</span>
      </div>

      {/* Rating & Reviews row */}
      <div className="flex items-center justify-between gap-3 text-[13px] pt-3 border-t border-border/60">
        <div className="flex items-center gap-2">
          {hasRating ? (
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3.5 w-3.5 fill-yellow-500" />
              <span className="font-[510] text-foreground ml-0.5">{course.rating!.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-[12px]">Unrated</span>
          )}
          
          {hasReviews && (
            <span className="text-[11px] text-muted-foreground">
              ({course.reviews!.toLocaleString()} reviews)
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="text-right">
          {hasPrice ? (
            isFree ? (
              <span className="text-[13px] font-[510] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Free</span>
            ) : (
              <span className="text-[14px] font-[510] text-foreground">
                ${course.price!.toFixed(2)}
              </span>
            )
          ) : (
            <span className="text-[12px] text-muted-foreground">TBD</span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <a
        href={course.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 rounded-full border border-border hover:bg-secondary hover:text-foreground text-[12px] font-[510] px-4 py-2 transition-colors duration-150 select-none mt-1 cursor-pointer bg-card text-muted-foreground"
      >
        <span>Go To Course</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}