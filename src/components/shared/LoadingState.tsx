import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  className?: string
}

export default function LoadingState({
  message = "Loading…",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 space-y-3 ${className}`}>
      <Loader2 className="h-6 w-6 text-neutral-400 animate-spin" />
      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{message}</p>
    </div>
  )
}
