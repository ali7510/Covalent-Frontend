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
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-border rounded-md bg-gradient-to-br from-background to-secondary/30 shadow-card-light dark:shadow-card-dark space-y-4 ${className}`}>
      <div className="p-3.5 bg-card border border-border rounded-full shadow-sm">
        {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground">{title}</h3>
        <p className="text-[13px] leading-[18px] text-muted-foreground font-normal max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  )
}
