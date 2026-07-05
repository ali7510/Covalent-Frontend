import { Link, useNavigate } from "react-router-dom"
import { Users, ChevronRight } from "lucide-react"
import type { SpaceResponse } from "@/lib/types"
import { useUserSpaces, useJoinSpace, useLeaveSpace } from "@/hooks/useSpaces"
import { toast } from "sonner"
import { isAxiosError } from "axios"

interface SpaceCardProps {
  space: SpaceResponse
}

export default function SpaceCard({ space }: SpaceCardProps) {
  const navigate = useNavigate()
  const { data: mySpaces } = useUserSpaces()
  const joinMutation = useJoinSpace()
  const leaveMutation = useLeaveSpace()

  const isJoined = mySpaces?.some((s) => s.id === space.id) ?? false
  const isPending = joinMutation.isPending || leaveMutation.isPending

  const handleJoinToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isJoined) {
      leaveMutation.mutate(space.id, {
        onSuccess: () => toast.success(`Left space: ${space.name}`),
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to leave space" : "Failed to leave space"),
      })
    } else {
      joinMutation.mutate(space.id, {
        onSuccess: () => toast.success(`Joined space: ${space.name}`),
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to join space" : "Failed to join space"),
      })
    }
  }

  const handleCardClick = () => {
    if (isJoined) {
      navigate(`/spaces/${space.id}`)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-card border border-border rounded-md pt-6 px-6 pb-7 flex flex-col justify-between shadow-card-light dark:shadow-card-dark hover:border-primary/30 transition-all duration-150 group ${
        isJoined ? "cursor-pointer" : ""
      }`}
    >
      {/* Top Row: Category Badge and Member Count */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        {space.category ? (
          <span className="rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium px-2 py-0.5">
            {space.category === "COLLEGE_COURSE" ? "Course" : space.category.replace("_", " ")}
          </span>
        ) : (
          <span className="rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium px-2 py-0.5">
            {space.courseCode || space.slug}
          </span>
        )}
        
        <div className="flex items-center space-x-1.5 text-[13px] text-muted-foreground font-medium">
          <Users size={14} className="text-muted-foreground" />
          <span>{space.memberCount} Members</span>
        </div>
      </div>

      {/* Middle Content */}
      <div className="space-y-2 mb-6">
        <h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground group-hover:underline">
          <Link 
            to={`/spaces/${space.id}`} 
            onClick={(e) => {
              if (!isJoined) e.preventDefault()
            }}
          >
            {space.name}
          </Link>
        </h3>
        <p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal text-muted-foreground line-clamp-2">
          {space.description || "No description provided."}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-auto">
        <button
          onClick={handleJoinToggle}
          disabled={isPending}
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-[15px] font-[510] min-h-[40px] min-w-[100px] active:scale-98 transition-all duration-200 cursor-pointer ${
            isJoined
              ? "bg-primary text-primary-foreground hover:bg-accent shadow-btn-primary"
              : "border border-primary text-primary hover:bg-primary/6"
          }`}
        >
          <span>{isJoined ? "Joined" : "Join Space"}</span>
        </button>
        
        {isJoined && (
          <Link
            to={`/spaces/${space.id}`}
            className="inline-flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted px-4 py-2 text-[15px] font-[510] min-h-[40px] active:scale-98 transition-all"
          >
            <span>Enter</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
    </div>
  )
}
