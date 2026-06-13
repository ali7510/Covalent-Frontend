import OnlineCourseCard from "@/components/shared/OnlineCourseCard"

export default function OnlineCoursesPage() {
  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
          Online <span className="font-[510]">Courses</span>
        </h1>
        <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
          Personalized course recommendations will appear here once the backend service is connected.
        </p>
      </div>

      <OnlineCourseCard />
    </div>
  )
}
