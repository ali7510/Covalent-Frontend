import { Link } from "react-router-dom"
import { Users, FolderKanban, ChevronRight } from "lucide-react"
import type { SpaceResponse } from "@/lib/types"
import { useUserSpaces, useJoinSpace, useLeaveSpace } from "@/hooks/useSpaces"
import { toast } from "sonner"
import { isAxiosError } from "axios"

interface SpaceCardProps {
  space: SpaceResponse
}

export default function SpaceCard({ space }: SpaceCardProps) {
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

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-200 group">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
            {space.courseCode || space.slug}
          </span>
          {space.category && (
            <div className="flex items-center space-x-1 text-[10px] text-neutral-450 dark:text-neutral-550 font-semibold uppercase">
              <FolderKanban className="h-3.5 w-3.5 text-neutral-400" />
              <span>{space.category}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug group-hover:underline">
            <Link to={`/spaces/${space.id}`}>{space.name}</Link>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed font-light line-clamp-2">
            {space.description || "No description"}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold uppercase">
          <Users className="h-3.5 w-3.5 text-neutral-400" />
          <span>{space.memberCount} Members</span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleJoinToggle}
            disabled={isPending}
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[10px] font-semibold active:scale-98 transition-all duration-200 ${
              isJoined
                ? "bg-neutral-950 text-white border-neutral-950 dark:bg-white dark:text-neutral-950 dark:border-white hover:opacity-90"
                : "border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            <span>{isJoined ? "Joined" : "Join Space"}</span>
          </button>
          
          <Link
            to={`/spaces/${space.id}`}
            className="inline-flex items-center space-x-1 rounded-lg border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 text-[10px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-98 transition-all"
          >
            <span>Enter</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
