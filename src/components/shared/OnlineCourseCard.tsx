import { Construction } from "lucide-react"

export default function OnlineCourseCard() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-md border border-border bg-card shadow-card-light dark:shadow-card-dark hover:border-primary/30 transition-all duration-150">
      <div className="p-4 bg-muted border border-border rounded-md">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground">Coming Soon</h3>
        <p className="text-[13px] leading-[18px] text-muted-foreground font-normal max-w-sm">
          Personalized online course recommendations powered by AI will be available here once the backend service is ready.
        </p>
      </div>
    </div>
  )
}
