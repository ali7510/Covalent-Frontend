import { Construction } from "lucide-react"

export default function OnlineCourseCard() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-16 text-center space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xs">
      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-2xl">
        <Construction className="h-8 w-8 text-neutral-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Coming Soon</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light max-w-sm leading-relaxed">
          Personalized online course recommendations powered by AI will be available here once the backend service is ready.
        </p>
      </div>
    </div>
  )
}
