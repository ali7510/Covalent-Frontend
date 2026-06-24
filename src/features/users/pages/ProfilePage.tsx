import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/features/auth/AuthContext"
import { useAllCourses, useRegisterCourse, useDeleteCourseRegistration, useUpdateCourseRegistration } from "@/hooks/useCourses"
import { useMyGamification } from "@/hooks/useGamification"
import { useUpdateProfile, useChangePassword, useToggleEmailPrefs, useToggleInAppPrefs } from "@/hooks/useUsers"
import UserAvatar from "@/components/shared/UserAvatar"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { GraduationCap, Mail, Settings as SettingsIcon, BookOpen, Award, Flame, Plus, X, Lock, User, Bell, Trash2, TrendingUp, CheckCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  department: z.string().optional(),
  academicYear: z.union([z.coerce.number().int().min(1).max(8), z.literal("")]).optional(),
  currentSemester: z.union([z.coerce.number().int().min(1).max(12), z.literal("")]).optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

const registerCourseSchema = z.object({
  courseName: z.string().min(2, "Course name is required"),
  courseCode: z.string().min(2, "Course code is required"),
  academicYear: z.coerce.number().int().min(1).max(8),
  semester: z.coerce.number().int().min(1).max(2),
})

const editGradeSchema = z.object({
  grade: z.string().optional(),
})

type UpdateProfileValues = z.infer<typeof updateProfileSchema>
type UpdateProfileRawValues = {
  fullName: string
  department?: string
  academicYear?: number | ""
  currentSemester?: number | ""
  bio?: string
}
type ChangePasswordValues = z.infer<typeof changePasswordSchema>
type RegisterCourseValues = z.infer<typeof registerCourseSchema>
type RegisterCourseRawValues = {
  courseName: string
  courseCode: string
  academicYear: number
  semester: number
}
type EditGradeValues = z.infer<typeof editGradeSchema>

// ---------------------------------------------------------------------------
// XP Level Helpers (Level = floor(1 + sqrt(xp / 100)))
// ---------------------------------------------------------------------------

function computeXpProgress(xp: number) {
  const level = Math.floor(1 + Math.sqrt(xp / 100))
  const xpAtLevel = Math.pow(level - 1, 2) * 100
  const xpForNext = Math.pow(level, 2) * 100
  const progress = xpForNext > xpAtLevel
    ? Math.min(1, (xp - xpAtLevel) / (xpForNext - xpAtLevel))
    : 1
  return { level, xpAtLevel, xpForNext, progress }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { data: courses, isLoading: coursesLoading } = useAllCourses()
  const { data: gamification, isLoading: gamLoading } = useMyGamification()

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<"curriculum" | "settings">("curriculum")

  // Modal States
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<{ id: string; courseName: string; grade?: string } | null>(null)

  // Notification toggles local states
  const [emailNotifs, setEmailNotifs] = useState(() => {
    const val = localStorage.getItem("emailNotifs")
    return val === null ? true : val === "true"
  })
  const [inAppNotifs, setInAppNotifs] = useState(() => {
    const val = localStorage.getItem("inAppNotifs")
    return val === null ? true : val === "true"
  })

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Hooks
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const toggleEmailMutation = useToggleEmailPrefs()
  const toggleInAppMutation = useToggleInAppPrefs()
  const registerCourseMutation = useRegisterCourse()
  const deleteCourseMutation = useDeleteCourseRegistration()
  const updateCourseMutation = useUpdateCourseRegistration()

  // ---------------------------------------------------------------------------
  // Forms
  // ---------------------------------------------------------------------------

  const profileForm = useForm<UpdateProfileRawValues>({
    resolver: zodResolver(updateProfileSchema) as Resolver<UpdateProfileRawValues>,
    defaultValues: {
      fullName: user?.fullName || "",
      department: user?.department || "",
      academicYear: user?.academicYear ? Number(user.academicYear) : "",
      currentSemester: user?.currentSemester ? Number(user.currentSemester) : "",
      bio: user?.bio || "",
    },
  })

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const courseForm = useForm<RegisterCourseRawValues>({
    resolver: zodResolver(registerCourseSchema) as Resolver<RegisterCourseRawValues>,
    defaultValues: { courseName: "", courseCode: "", academicYear: 1, semester: 1 },
  })

  const gradeForm = useForm<EditGradeValues>({
    resolver: zodResolver(editGradeSchema),
    defaultValues: { grade: "" },
  })

  // ---------------------------------------------------------------------------
  // Submit Handlers
  // ---------------------------------------------------------------------------

  const handleUpdateProfileSubmit = (values: UpdateProfileRawValues) => {
    updateProfileMutation.mutate(
      {
        fullName: values.fullName,
        bio: values.bio || undefined,
        academicYear: values.academicYear ? Number(values.academicYear) : undefined,
        currentSemester: values.currentSemester ? Number(values.currentSemester) : undefined,
        department: values.department || undefined,
      },
      {
        onSuccess: () => toast.success("Academic profile updated successfully!"),
        onError: (err) => {
          const message = axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Failed to update profile"
          toast.error(message)
        },
      }
    )
  }

  // FIX: On password change success, call logout() which clears localStorage and redirects to /login
  const handleChangePasswordSubmit = (values: ChangePasswordValues) => {
    changePasswordMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed. Please sign in again with your new credentials.")
          logout()
        },
        onError: (err) => {
          const message = axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Failed to change password"
          toast.error(message)
        },
      }
    )
  }

  const handleAddCourseSubmit = (values: RegisterCourseValues) => {
    registerCourseMutation.mutate(
      {
        courseCode: values.courseCode,
        courseName: values.courseName,
        academicYear: Number(values.academicYear),
        semester: Number(values.semester),
      },
      {
        onSuccess: () => {
          toast.success("Course registered successfully!")
          courseForm.reset()
          setIsAddCourseOpen(false)
        },
        onError: (err) => {
          const message = axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Failed to register course"
          toast.error(message)
        },
      }
    )
  }

  const handleDeleteCourse = (courseId: string) => {
    deleteCourseMutation.mutate(courseId, {
      onSuccess: () => toast.success("Course registration removed"),
      onError: () => toast.error("Failed to delete course registration"),
    })
  }

  const handleOpenEditGrade = (course: { id: string; courseName: string; grade?: string }) => {
    setEditingCourse(course)
    gradeForm.reset({ grade: course.grade || "" })
  }

  const handleEditGradeSubmit = (values: EditGradeValues) => {
    if (!editingCourse) return
    updateCourseMutation.mutate(
      {
        id: editingCourse.id,
        body: {
          grade: values.grade?.trim() || undefined,
          result: values.grade?.trim() ? 1.0 : 0.0,
          isCurrent: !values.grade?.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Course grade updated!")
          setEditingCourse(null)
        },
        onError: () => toast.error("Failed to update course grade"),
      }
    )
  }

  const handleToggleEmail = () => {
    toggleEmailMutation.mutate(undefined, {
      onSuccess: () => {
        const next = !emailNotifs
        setEmailNotifs(next)
        localStorage.setItem("emailNotifs", String(next))
        toast.success("Email preference toggled")
      },
      onError: () => {
        toast.error("Failed to update email notification preference")
      },
    })
  }

  const handleToggleInApp = () => {
    toggleInAppMutation.mutate(undefined, {
      onSuccess: () => {
        const next = !inAppNotifs
        setInAppNotifs(next)
        localStorage.setItem("inAppNotifs", String(next))
        toast.success("In-App preference toggled")
      },
      onError: () => {
        toast.error("Failed to update in-app notification preference")
      },
    })
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const activeCourses = courses?.filter((c) => c.isCurrent) ?? []
  const pastCourses = courses?.filter((c) => !c.isCurrent) ?? []
  const xpInfo = gamification ? computeXpProgress(gamification.xpPoints) : null

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
          Academic <span className="font-[510]">Profile</span>
        </h1>
        <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
          Manage your student credentials, review registered modules, and analyze performance calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Profile Card Summary / Left */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark flex flex-col items-center text-center space-y-4">
            <UserAvatar className="h-20 w-20 ring-2 ring-border" fallbackClassName="text-xl" />

            <div className="space-y-1.5">
              <h3 className="text-[15px] font-[510] text-foreground">{user?.fullName || "N/A"}</h3>
              {gamification && (
                <span className="inline-block text-[10px] font-[510] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                  Level {gamification.level}
                </span>
              )}
              <p className="text-[12px] text-muted-foreground font-normal leading-relaxed max-w-xs line-clamp-3">
                {user?.bio || "No student bio provided."}
              </p>
            </div>

            {/* Profile Meta List */}
            <div className="w-full pt-4 border-t border-border text-left space-y-3 text-[12px] text-muted-foreground">
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4" />
                <span>{user?.email || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="h-4 w-4" />
                <span>ID: {user?.studentId || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <SettingsIcon className="h-4 w-4" />
                <span>Dept: {user?.department || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Gamification Card */}
          {gamLoading ? (
            <LoadingState message="Loading stats…" className="rounded-md border border-border bg-card" />
          ) : gamification && xpInfo ? (
            <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
              <h3 className="text-[13px] font-[510] text-foreground flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>Gamification Metrics</span>
              </h3>

              {/* XP Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-[510]">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Level {xpInfo.level} Progress</span>
                  </span>
                  <span className="text-foreground">
                    {gamification.xpPoints.toLocaleString()} / {xpInfo.xpForNext.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(xpInfo.progress * 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground font-normal">
                  {Math.round(xpInfo.progress * 100)}% to Level {xpInfo.level + 1}
                </p>
              </div>

              <div className="space-y-3 text-[12px] border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XP Points</span>
                  <span className="font-[510] text-foreground">{gamification.xpPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-[510] text-foreground">{gamification.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Answers</span>
                  <span className="font-[510] text-foreground">{gamification.totalAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Streak</span>
                  <div className="flex items-center space-x-1.5 p-1 px-2.5 rounded-md bg-secondary border border-border">
                    <Flame className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-[10px] font-[510] text-foreground">{gamification.currentStreakDays}d</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Section: Sub-Tabs layout */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sub-Tabs Selector */}
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveSubTab("curriculum")}
              className={`px-4 py-1.5 rounded-md text-[12px] font-[510] capitalize transition-all duration-200 ${activeSubTab === "curriculum"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Academic Curriculum
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`px-4 py-1.5 rounded-md text-[12px] font-[510] capitalize transition-all duration-200 ${activeSubTab === "settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Profile Settings
            </button>
          </div>

          {/* CURRICULUM TAB */}
          {activeSubTab === "curriculum" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats overview cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border bg-card p-5 shadow-card-light dark:shadow-card-dark">
                  <span className="text-[10px] text-muted-foreground font-[510] tracking-wide uppercase">Cumulative GPA</span>
                  <p className="text-[22px] font-[510] tracking-tight text-foreground mt-1">{user?.gpa != null ? user.gpa.toFixed(2) : "N/A"}</p>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{user?.department || "N/A"}</span>
                </div>
                <div className="rounded-md border border-border bg-card p-5 shadow-card-light dark:shadow-card-dark">
                  <span className="text-[10px] text-muted-foreground font-[510] tracking-wide uppercase">Semester</span>
                  <p className="text-[22px] font-[510] tracking-tight text-foreground mt-1">{user?.currentSemester ?? "N/A"}</p>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Year {user?.academicYear ?? "N/A"}</span>
                </div>
              </div>

              {/* Active Courses */}
              <div className="rounded-md border border-border bg-card overflow-hidden shadow-card-light dark:shadow-card-dark">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-[12px] font-[510] uppercase tracking-wider text-foreground flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>Active Modules</span>
                  </h3>
                  <button
                    onClick={() => setIsAddCourseOpen(true)}
                    className="inline-flex items-center space-x-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[10px] font-[510] hover:opacity-90 active:scale-98 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Register Module</span>
                  </button>
                </div>

                {coursesLoading ? (
                  <LoadingState message="Loading modules…" />
                ) : activeCourses.length === 0 ? (
                  <EmptyState title="No active courses" description="You have no currently enrolled modules." />
                ) : (
                  <div className="divide-y divide-border text-[12px]">
                    {activeCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                        <div className="space-y-1">
                          <p className="font-[510] text-foreground">{course.courseName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Code: <span className="font-[510] uppercase">{course.courseCode}</span> • Year {course.academicYear} • Sem {course.semester}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <button
                            onClick={() => handleOpenEditGrade(course)}
                            className="inline-flex items-center space-x-1 p-1 px-2.5 rounded-md border border-border text-[10px] font-[510] text-muted-foreground hover:text-foreground hover:bg-secondary"
                          >
                            <span>Set Grade</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Courses */}
              {!coursesLoading && pastCourses.length > 0 && (
                <div className="rounded-md border border-border bg-card overflow-hidden shadow-card-light dark:shadow-card-dark">
                  <div className="p-5 border-b border-border">
                    <h3 className="text-[12px] font-[510] uppercase tracking-wider text-foreground flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Completed Modules</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-border text-[12px]">
                    {pastCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                        <div className="space-y-1">
                          <p className="font-[510] text-foreground">{course.courseName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Code: <span className="font-[510] uppercase">{course.courseCode}</span> • Year {course.academicYear} • Sem {course.semester}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary border border-border text-[10px] font-[510] text-foreground">
                            {course.grade || "—"}
                          </span>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeSubTab === "settings" && (
            <div className="space-y-6 animate-fade-in text-[12px]">

              {/* Profile details config form */}
              <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
                <h3 className="text-[12px] font-[510] uppercase tracking-wider text-foreground flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Academic Details</span>
                </h3>

                <form onSubmit={profileForm.handleSubmit(handleUpdateProfileSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Full Name *</label>
                    <input
                      type="text"
                      {...profileForm.register("fullName")}
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                    />
                    {profileForm.formState.errors.fullName && (
                      <p className="text-[10px] text-red-500">{profileForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Department</label>
                    <input
                      type="text"
                      {...profileForm.register("department")}
                      placeholder="e.g. Computer Science"
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Cumulative GPA</label>
                    <input
                      type="text"
                      value={user?.gpa != null ? user.gpa.toFixed(2) : "N/A"}
                      readOnly
                      disabled
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-secondary text-muted-foreground cursor-not-allowed opacity-75"
                    />
                    <p className="text-[9px] text-muted-foreground font-normal">Calculated automatically from your registered modules.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Academic Year</label>
                      <input
                        type="number"
                        {...profileForm.register("academicYear")}
                        min={1}
                        max={8}
                        className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Semester</label>
                      <input
                        type="number"
                        {...profileForm.register("currentSemester")}
                        min={1}
                        max={12}
                        className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="col-span-full space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Bio / Academic Target</label>
                    <textarea
                      {...profileForm.register("bio")}
                      rows={3}
                      placeholder="Share your research interests or study path details..."
                      className="w-full rounded-md border border-border p-2.5 focus:outline-none resize-none bg-background text-foreground"
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-[10px] text-red-500">{profileForm.formState.errors.bio.message}</p>
                    )}
                  </div>

                  <div className="col-span-full flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-[510] hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification Prefs toggles */}
              <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
                <h3 className="text-[12px] font-[510] uppercase tracking-wider text-foreground flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notification Subscriptions</span>
                </h3>

                <div className="space-y-3.5 border-t border-border pt-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-[510] text-foreground">Email Bulletins</p>
                      <span className="text-[10px] text-muted-foreground font-normal">Send digests on answer acceptances and shared sheets.</span>
                    </div>
                    <button
                      onClick={handleToggleEmail}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${emailNotifs ? "bg-primary" : "bg-secondary border border-border"
                        }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-4" : "translate-x-0.5"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-[510] text-foreground">In-App Alerts</p>
                      <span className="text-[10px] text-muted-foreground font-normal">Show pop-up bells when you receive upvotes or comments.</span>
                    </div>
                    <button
                      onClick={handleToggleInApp}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${inAppNotifs ? "bg-primary" : "bg-secondary border border-border"
                        }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${inAppNotifs ? "translate-x-4" : "translate-x-0.5"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password update form */}
              <div className="rounded-md border border-red-200 dark:border-red-900/30 bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
                <h3 className="text-[12px] font-[510] uppercase tracking-wider text-foreground flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Update Password Credentials</span>
                </h3>
                <p className="text-[10px] text-muted-foreground font-normal leading-relaxed border-t border-border pt-3.5">
                  Changing your password will immediately terminate all active sessions on all devices. You will be redirected to the login page.
                </p>

                <form onSubmit={passwordForm.handleSubmit(handleChangePasswordSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        {...passwordForm.register("currentPassword")}
                        placeholder="••••••••"
                        className="w-full rounded-md border border-border p-2.5 pr-10 focus:outline-none bg-background text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-[10px] text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          {...passwordForm.register("newPassword")}
                          placeholder="••••••••"
                          className="w-full rounded-md border border-border p-2.5 pr-10 focus:outline-none bg-background text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-[10px] text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...passwordForm.register("confirmPassword")}
                          placeholder="••••••••"
                          className="w-full rounded-md border border-border p-2.5 pr-10 focus:outline-none bg-background text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-[10px] text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="px-4 py-2 rounded-full bg-red-600 text-white font-[510] hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {changePasswordMutation.isPending ? "Updating..." : "Change Password & Sign Out"}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* REGISTER COURSE MODAL */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Register Module</h3>
              <button
                onClick={() => { setIsAddCourseOpen(false); courseForm.reset() }}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={courseForm.handleSubmit(handleAddCourseSubmit)} className="space-y-4 text-[12px]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Course Name *</label>
                <input
                  type="text"
                  {...courseForm.register("courseName")}
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                />
                {courseForm.formState.errors.courseName && (
                  <p className="text-[10px] text-red-500">{courseForm.formState.errors.courseName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Course Code *</label>
                  <input
                    type="text"
                    {...courseForm.register("courseCode")}
                    placeholder="e.g. CS-420"
                    className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                  />
                  {courseForm.formState.errors.courseCode && (
                    <p className="text-[10px] text-red-500">{courseForm.formState.errors.courseCode.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Academic Year</label>
                  <select
                    {...courseForm.register("academicYear")}
                    className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Semester</label>
                  <select
                    {...courseForm.register("semester")}
                    className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setIsAddCourseOpen(false); courseForm.reset() }}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerCourseMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {registerCourseMutation.isPending ? "Registering..." : "Register Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE GRADE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Update Course Grade</h3>
              <button onClick={() => setEditingCourse(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={gradeForm.handleSubmit(handleEditGradeSubmit)} className="space-y-4 text-[12px]">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Update your grade for <span className="font-[510]">{editingCourse.courseName}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Entering a grade will automatically mark this module as completed. Leave it empty to keep it as currently enrolled.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Letter Grade</label>
                <input
                  type="text"
                  {...gradeForm.register("grade")}
                  placeholder="e.g. A, B+, C"
                  className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {updateCourseMutation.isPending ? "Updating..." : "Update Grade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
