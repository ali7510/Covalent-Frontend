import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Plus, 
  X, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  TrendingUp,
  Search,
  Sparkles,
  Globe,
  Clock
} from "lucide-react"

import {
  useAllCourses,
  useCurrentCourses,
  useRegisterCourse,
  useUpdateCourseRegistration,
  useDeleteCourseRegistration,
  useCourseCatalog,
} from "@/hooks/useCourses"
import { useOnlineCourseRecommendations } from "@/hooks/useRecommendations"
import AcademicCourseCard from "@/components/shared/AcademicCourseCard"
import OnlineCourseCard from "@/components/shared/OnlineCourseCard"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import type { CourseRegistrationResponse } from "@/lib/types"

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const registerCourseSchema = z.object({
  courseCode: z.string().min(1, "Please select a course"),
  hasGrades: z.boolean().default(false),
  termWork: z.union([z.coerce.number().min(0).max(40), z.literal("")]).optional(),
  examWork: z.union([z.coerce.number().min(0).max(60), z.literal("")]).optional(),
}).refine((data) => {
  if (data.hasGrades) {
    const termVal = data.termWork;
    const examVal = data.examWork;
    return (
      termVal !== "" && termVal !== undefined &&
      examVal !== "" && examVal !== undefined
    );
  }
  return true;
}, {
  message: "Both term work (0-40) and exam work (0-60) are required if grades are included.",
  path: ["examWork"],
});

const editGradeSchema = z.object({
  hasGrades: z.boolean().default(false),
  termWork: z.union([z.coerce.number().min(0).max(40), z.literal("")]).optional(),
  examWork: z.union([z.coerce.number().min(0).max(60), z.literal("")]).optional(),
  closed: z.boolean(),
}).refine((data) => {
  const hasTerm = data.termWork !== "" && data.termWork !== undefined;
  const hasExam = data.examWork !== "" && data.examWork !== undefined;
  // If one is provided, both must be provided
  if (hasTerm || hasExam) {
    return hasTerm && hasExam;
  }
  // If closed is checked, both must be provided
  if (data.closed) {
    return hasTerm && hasExam;
  }
  return true;
}, {
  message: "Both term work (0-40) and exam work (0-60) must be provided together, or both left blank.",
  path: ["examWork"],
});

type RegisterCourseValues = z.infer<typeof registerCourseSchema>
type EditGradeValues = z.infer<typeof editGradeSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeGpa(courses: CourseRegistrationResponse[]): string {
  const graded = courses.filter((c) => c.grade && c.points !== null)
  if (graded.length === 0) return "N/A"
  const avg = graded.reduce((sum, c) => sum + (c.points ?? 0), 0) / graded.length
  return avg.toFixed(2)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OnlineCoursesPage() {
  // Query Client for cache invalidation
  const queryClient = useQueryClient()

  // Main Navigation Tab
  const [pageTab, setPageTab] = useState<"academic" | "online">("academic")

  // Academic Tracker States
  const [activeTab, setActiveTab] = useState<"current" | "all">("current")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseRegistrationResponse | null>(null)

  // Online Recommendations Filters
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("score")

  // Fetch Academic Courses & Catalog
  const { data: allCourses, isLoading: allLoading } = useAllCourses()
  const { data: currentCourses, isLoading: currentLoading } = useCurrentCourses()
  const { data: catalogData, isLoading: catalogLoading } = useCourseCatalog()

  // Fetch Online Course Recommendations Data
  const { data: onlineCourses, isLoading: recsLoading } = useOnlineCourseRecommendations()

  // Academic Mutations
  const registerMutation = useRegisterCourse()
  const updateMutation = useUpdateCourseRegistration()
  const deleteMutation = useDeleteCourseRegistration()

  const isAcademicLoading = allLoading || currentLoading || catalogLoading
  const displayedAcademicCourses = activeTab === "current" ? (currentCourses ?? []) : (allCourses ?? [])

  // Create course catalog lookup map
  const catalogMap = useMemo(() => {
    if (!catalogData?.courses) return {};
    return catalogData.courses.reduce((acc, c) => {
      acc[c.code] = c.name;
      return acc;
    }, {} as Record<string, string>);
  }, [catalogData]);

  // Quick stats derived from allCourses
  const total = allCourses?.length ?? 0
  const completedCount = allCourses?.filter((c) => c.closed).length ?? 0
  const currentCount = allCourses?.filter((c) => !c.closed).length ?? 0
  const gpa = allCourses ? computeGpa(allCourses) : "N/A"

  // Distinct academic courses registered by the student (for dropdown filter list)
  const uniqueRegisteredCourses = Array.from(
    new Map((allCourses ?? []).map((c) => [c.code, c])).values()
  )

  // Client-side filtering & sorting for Online Course recommendations
  const filteredOnlineCourses = (onlineCourses ?? [])
    .filter((c) => {
      const matchesCourse = selectedCourseCode === "all" || c.courseCode === selectedCourseCode
      const matchesPlatform = selectedPlatform === "all" || c.source.toLowerCase() === selectedPlatform.toLowerCase()
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCourse && matchesPlatform && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.score ?? 0) - (a.score ?? 0)
      }
      if (sortBy === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0)
      }
      if (sortBy === "price") {
        return (a.price ?? 0) - (b.price ?? 0)
      }
      return 0
    })

  // Forms
  const courseForm = useForm<RegisterCourseValues>({
    resolver: zodResolver(registerCourseSchema),
    defaultValues: { courseCode: "", hasGrades: false, termWork: "", examWork: "" },
  })

  const gradeForm = useForm<EditGradeValues>({
    resolver: zodResolver(editGradeSchema),
    defaultValues: { hasGrades: false, termWork: "", examWork: "", closed: false },
  })

  // Handlers
  const handleRegisterSubmit = (values: RegisterCourseValues) => {
    const termVal = values.hasGrades && values.termWork !== "" && values.termWork !== undefined ? Number(values.termWork) : undefined;
    const examVal = values.hasGrades && values.examWork !== "" && values.examWork !== undefined ? Number(values.examWork) : undefined;

    registerMutation.mutate(
      { 
        code: values.courseCode, 
        termWork: termVal, 
        examWork: examVal 
      },
      {
        onSuccess: () => {
          toast.success("Course registered successfully")
          setIsAddOpen(false)
          courseForm.reset()
          // FIX #7: Invalidate recommendations cache so new courses appear immediately
          queryClient.invalidateQueries({ queryKey: ["onlineCourseRecommendations"] })
        },
        onError: (err) => {
          toast.error(
            isAxiosError(err) ? err.response?.data?.message ?? "Failed to register course" : "Failed to register course"
          )
        },
      }
    )
  }

  const handleEditOpen = (course: CourseRegistrationResponse) => {
    setEditingCourse(course)
    const hasExistingGrades = course.termWork !== null && course.examWork !== null;
    gradeForm.reset({ 
      hasGrades: hasExistingGrades,
      termWork: course.termWork ?? "", 
      examWork: course.examWork ?? "",
      closed: course.closed 
    })
  }

  const handleGradeSubmit = (values: EditGradeValues) => {
    if (!editingCourse) return

    const hasVals = values.hasGrades || values.closed;
    const termVal = hasVals && values.termWork !== "" && values.termWork !== undefined ? Number(values.termWork) : null;
    const examVal = hasVals && values.examWork !== "" && values.examWork !== undefined ? Number(values.examWork) : null;

    updateMutation.mutate(
      {
        id: editingCourse.id.toString(),
        body: {
          termWork: termVal !== null ? termVal : undefined,
          examWork: examVal !== null ? examVal : undefined,
          closed: values.closed,
        },
      },
      {
        onSuccess: () => {
          toast.success("Course updated")
          setEditingCourse(null)
        },
        onError: (err) => {
          toast.error(
            isAxiosError(err) ? err.response?.data?.message ?? "Failed to update course" : "Failed to update course"
          )
        },
      }
    )
  }

  const handleDelete = (courseId: string) => {
    deleteMutation.mutate(courseId, {
      onSuccess: () => toast.success("Course removed"),
      onError: (err) => {
        toast.error(
          isAxiosError(err) ? err.response?.data?.message ?? "Failed to remove course" : "Failed to remove course"
        )
      },
    })
  }

  // Watchers for conditional grade fields
  const watchHasGradesRegister = courseForm.watch("hasGrades")
  const watchHasGradesEdit = gradeForm.watch("hasGrades")

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
            Courses <span className="font-[510]">Hub</span>
          </h1>
          <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
            {pageTab === "academic" 
              ? "Track your registered university courses, record grades, and monitor your academic progress." 
              : "Discover handpicked online courses from Coursera, Udemy, and edX tailored to your registered courses."
            }
          </p>
        </div>

        {pageTab === "academic" && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="self-start sm:self-center inline-flex items-center space-x-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-[13px] font-[510] hover:opacity-90 active:scale-98 transition-all shadow-btn-primary cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-3">
        <button
          onClick={() => setPageTab("academic")}
          className={`px-4 py-2 rounded-md text-[13px] font-[510] transition-all duration-200 cursor-pointer ${
            pageTab === "academic"
              ? "bg-primary text-primary-foreground shadow-btn-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Academic Tracker
        </button>
        <button
          onClick={() => setPageTab("online")}
          className={`px-4 py-2 rounded-md text-[13px] font-[510] transition-all duration-200 cursor-pointer ${
            pageTab === "online"
              ? "bg-primary text-primary-foreground shadow-btn-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Online Recommendations
        </button>
      </div>

      {/* TAB CONTENT: ACADEMIC TRACKER */}
      {pageTab === "academic" && (
        <div className="space-y-6 animate-fade-in duration-200">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Registered", value: total, icon: BookOpen },
              { label: "Currently Taking", value: currentCount, icon: TrendingUp },
              { label: "Completed", value: completedCount, icon: CheckCircle },
              { label: "Cumulative GPA", value: gpa, icon: GraduationCap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-md border border-border bg-card p-4 shadow-card-light dark:shadow-card-dark flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">{label}</span>
                  <p className="text-[20px] font-[510] tracking-tight text-foreground">{value}</p>
                </div>
                <div className="p-2 bg-secondary border border-border rounded-md">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
              </div>
            ))}
          </div>

          {/* Sub-tabs (Current vs All) */}
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-4 py-1.5 rounded-md text-[12px] font-[510] transition-all duration-200 cursor-pointer ${
                activeTab === "current" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Current ({currentCount})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-md text-[12px] font-[510] transition-all duration-200 cursor-pointer ${
                activeTab === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Courses ({total})
            </button>
          </div>

          {/* Academic Course Grid */}
          {isAcademicLoading ? (
            <LoadingState message="Loading courses…" />
          ) : displayedAcademicCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-6 w-6 text-muted-foreground" />}
              title={activeTab === "current" ? "No current courses" : "No courses registered"}
              description={
                activeTab === "current"
                  ? "You have no active courses this semester. Add a course to get started."
                  : "Register your courses to track grades and academic progress."
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAcademicCourses.map((course) => (
                <AcademicCourseCard
                  key={course.id}
                  course={course}
                  courseName={catalogMap[course.code]}
                  onEdit={handleEditOpen}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ONLINE RECOMMENDATIONS */}
      {pageTab === "online" && (
        <div className="space-y-6 animate-fade-in duration-200">
          {/* Top Filters & Search Bar */}
          <div className="rounded-md border border-border bg-card p-5 shadow-card-light dark:shadow-card-dark space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Text Search */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search course titles or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-md border border-border focus:outline-none bg-background text-foreground text-[13px] placeholder:text-muted-foreground"
                />
              </div>

              {/* Filter: Academic Course */}
              <div className="md:col-span-3">
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  className="w-full rounded-md border border-border py-2.5 px-3 pr-8 focus:outline-none bg-background text-foreground text-[13px]"
                >
                  <option value="all">All Academic Courses</option>
                  {uniqueRegisteredCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {catalogMap[c.code] || c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Platform */}
              <div className="md:col-span-2">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full rounded-md border border-border py-2.5 px-3 pr-8 focus:outline-none bg-background text-foreground text-[13px]"
                >
                  <option value="all">All Platforms</option>
                  <option value="coursera">Coursera</option>
                  <option value="udemy">Udemy</option>
                  <option value="edx">edX</option>
                  <option value="geeksforgeeks">GeeksForGeeks</option>
                  <option value="mit ocw">MIT OCW</option>
                  <option value="freecodecamp">FreeCodeCamp</option>
                  <option value="w3schools">W3Schools</option>
                  <option value="youtube">YouTube</option>
                  <option value="khan academy">Khan Academy</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-border py-2.5 px-3 pr-8 focus:outline-none bg-background text-foreground text-[13px]"
                >
                  <option value="score">Highest Match Score</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recommendations Display */}
          {recsLoading ? (
            <LoadingState message="Fetching personalized recommendations…" />
          ) : filteredOnlineCourses.length === 0 ? (
            <EmptyState
              icon={<Globe className="h-6 w-6 text-muted-foreground" />}
              title="No online courses found"
              description={
                onlineCourses && onlineCourses.length === 0 
                  ? "Register academic courses in the Tracker to receive personalized online recommendation matches."
                  : "Try relaxing your search terms or filters to explore more courses."
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Recommendation Intro Banner */}
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-md text-[13px] text-primary font-[510]">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                <span>We found {filteredOnlineCourses.length} online courses matching your student profile.</span>
              </div>

              {/* Course Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOnlineCourses.map((course) => (
                  <OnlineCourseCard
                    key={course.id}
                    course={course}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Register a Course</h3>
              <button
                onClick={() => { setIsAddOpen(false); courseForm.reset() }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={courseForm.handleSubmit(handleRegisterSubmit)} className="space-y-4 text-[12px]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Select Course *</label>
                <select
                  {...courseForm.register("courseCode")}
                  className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                >
                  <option value="">Select a course from catalog...</option>
                  {catalogData?.courses?.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                {courseForm.formState.errors.courseCode && (
                  <p className="text-[10px] text-destructive">{courseForm.formState.errors.courseCode.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="hasGrades"
                  {...courseForm.register("hasGrades")}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="hasGrades" className="text-[11px] text-foreground font-medium cursor-pointer">
                  Include grades (Term Work and Exam Work)
                </label>
              </div>

              {watchHasGradesRegister && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Term Work (0–40) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="40"
                      {...courseForm.register("termWork")}
                      placeholder="e.g. 32.5"
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                    />
                    {courseForm.formState.errors.termWork && (
                      <p className="text-[10px] text-destructive">{courseForm.formState.errors.termWork.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Exam Work (0–60) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="60"
                      {...courseForm.register("examWork")}
                      placeholder="e.g. 48.0"
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                    />
                    {courseForm.formState.errors.examWork && (
                      <p className="text-[10px] text-destructive">{courseForm.formState.errors.examWork.message}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); courseForm.reset() }}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-btn-primary"
                >
                  {registerMutation.isPending ? "Registering…" : "Register Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GRADE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Update Course Details</h3>
              <button onClick={() => setEditingCourse(null)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={gradeForm.handleSubmit(handleGradeSubmit)} className="space-y-4 text-[12px]">
              <div className="space-y-1">
                <p className="font-medium text-foreground text-[13px]">
                  {catalogMap[editingCourse.code] || editingCourse.code}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Update course progress and grading values.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="hasGradesEdit"
                  {...gradeForm.register("hasGrades")}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="hasGradesEdit" className="text-[11px] text-foreground font-medium cursor-pointer">
                  Has grades (Term Work and Exam Work)
                </label>
              </div>

              {(watchHasGradesEdit || gradeForm.watch("closed")) && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Term Work (0–40)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="40"
                      {...gradeForm.register("termWork")}
                      placeholder="e.g. 35.0"
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Exam Work (0–60)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="60"
                      {...gradeForm.register("examWork")}
                      placeholder="e.g. 52.0"
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                    />
                  </div>
                </div>
              )}

              {gradeForm.formState.errors.examWork && (
                <p className="text-[10px] text-destructive">{gradeForm.formState.errors.examWork.message}</p>
              )}

              <div className="flex items-center space-x-2 pt-1 border-t border-border/50 pt-3">
                <input
                  type="checkbox"
                  id="closed"
                  {...gradeForm.register("closed")}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="closed" className="text-[11px] text-foreground font-medium cursor-pointer flex items-center space-x-1.5">
                  <span>Mark course as finished/closed</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-btn-primary"
                >
                  {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}