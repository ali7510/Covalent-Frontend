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
      <Loader2 className="h-6 w-6 text-primary animate-spin" />
      <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">{message}</p>
    </div>
  )
}
