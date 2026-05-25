import OnlineCourseCard from "@/components/shared/OnlineCourseCard"

export default function OnlineCoursesPage() {
  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
          Online <span className="font-semibold">Courses</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-light max-w-2xl text-sm leading-relaxed">
          Personalized course recommendations will appear here once the backend service is connected.
        </p>
      </div>

      <OnlineCourseCard />
    </div>
  )
}
