import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export default function EmptyState({
  icon,
  title = "No data available",
  description = "There is nothing to display at the moment.",
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center space-y-3 ${className}`}>
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-full">
        {icon || <Inbox className="h-6 w-6 text-neutral-400" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-850 dark:text-neutral-250">{title}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light mt-0.5">{description}</p>
      </div>
    </div>
  )
}
