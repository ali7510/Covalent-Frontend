import { FileText, Download, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { MaterialResponse } from "@/lib/types"

interface FileCardProps {
  material: MaterialResponse
  isUploader?: boolean
  onDownload?: (materialId: string) => void
  onEdit?: (material: MaterialResponse) => void
  onDelete?: (materialId: string) => void
}

export default function FileCard({ material, isUploader, onDownload, onEdit, onDelete }: FileCardProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(material.createdAt), { addSuffix: true })
    } catch {
      return material.createdAt || "N/A"
    }
  })()

  const sizeLabel = material.fileSizeKb
    ? material.fileSizeKb >= 1024
      ? `${(material.fileSizeKb / 1024).toFixed(1)} MB`
      : `${material.fileSizeKb} KB`
    : "N/A"

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3.5">
        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 rounded-lg">
          <FileText className="h-4.5 w-4.5 text-neutral-500" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-neutral-850 dark:text-neutral-200 leading-none">{material.title}</h4>
          {material.description && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-405 mt-1.5 font-light leading-relaxed">
              {material.description}
            </p>
          )}
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-1">
            Format: <span className="font-semibold">{material.resourceType}</span> • Size: {sizeLabel} • Shared by {material.uploadedByName || "N/A"} • {timeAgo}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={() => onDownload?.(material.id)}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-[10px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-98 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </button>

        {isUploader && (
          <>
            <button
              onClick={() => onEdit?.(material)}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-98 transition-all"
              title="Edit Resource"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete?.(material.id)}
              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-505 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-98 transition-all"
              title="Delete Resource"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
