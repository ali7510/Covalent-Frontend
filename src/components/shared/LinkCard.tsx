import { ExternalLink, Edit, Trash2, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { MaterialResponse } from "@/lib/types"

interface LinkCardProps {
  material: MaterialResponse
  isUploader?: boolean
  isJoined?: boolean
  onEdit?: (material: MaterialResponse) => void
  onDelete?: (materialId: string) => void
  onToggleBookmark?: (materialId: string, isCurrentlyBookmarked: boolean) => void
}

export default function LinkCard({ 
  material, 
  isUploader, 
  isJoined = false, 
  onEdit, 
  onDelete, 
  onToggleBookmark 
}: LinkCardProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(material.createdAt), { addSuffix: true })
    } catch {
      return material.createdAt || "N/A"
    }
  })()

  return (
    <div className="bg-card border border-border rounded-md shadow-card-light dark:shadow-card-dark p-6 hover:border-primary/30 transition-all duration-150 flex flex-col justify-between">
      {/* Top Row: Link Icon and Link Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-muted border border-border rounded-md shrink-0">
          <ExternalLink className="h-6 w-6 text-muted-foreground" />
        </div>
        <span className="rounded-full text-[13px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">
          LINK
        </span>
      </div>

      {/* Middle Content: Title and Description */}
      <div className="space-y-2 mb-4">
        <h4 className="text-[16px] leading-[24px] font-[510] text-foreground line-clamp-1">{material.title}</h4>
        {material.description && (
          <p className="text-[15px] leading-[24px] font-normal text-muted-foreground line-clamp-2">
            {material.description}
          </p>
        )}
        <div className="text-[13px] text-muted-foreground font-normal">
          Shared by <span className="font-medium text-foreground">{material.uploadedByName || "Anonymous"}</span> • {timeAgo}
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="flex items-center space-x-4">
          {/* Bookmark Count indicator */}
          <div className="flex items-center space-x-1.5 text-[13px] text-muted-foreground font-medium">
            <Bookmark className={`h-4.5 w-4.5 ${material.isBookmarked ? "fill-primary text-primary stroke-primary" : "text-muted-foreground"}`} />
            <span>{material.linkCount || 0}</span>
          </div>

          {/* Visit Link Action */}
          <a
            href={material.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-primary text-primary px-4 py-1.5 text-[13px] font-[510] min-h-[40px] hover:bg-primary/6 active:scale-98 transition-all"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            <span>Visit Link</span>
          </a>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bookmark Toggle */}
          {isJoined && onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(material.id, material.isBookmarked)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title={material.isBookmarked ? "Remove Bookmark" : "Bookmark Material"}
            >
              <Bookmark className={`h-4.5 w-4.5 ${material.isBookmarked ? "fill-primary text-primary stroke-primary" : "text-muted-foreground"}`} />
            </button>
          )}

          {/* Edit / Delete options for Uploader */}
          {isUploader && (
            <div className="flex items-center space-x-1 border-l border-border pl-2">
              <button
                onClick={() => onEdit?.(material)}
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Edit Material"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete?.(material.id)}
                className="p-2 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                title="Delete Material"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
