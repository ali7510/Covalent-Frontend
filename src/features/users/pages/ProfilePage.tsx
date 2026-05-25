import { useState } from "react"
import { useAuth } from "@/features/auth/AuthContext"
import { useAllCourses, useRegisterCourse, useDeleteCourseRegistration, useUpdateCourseRegistration } from "@/hooks/useCourses"
import { useMyGamification } from "@/hooks/useGamification"
import { useUpdateProfile, useChangePassword, useToggleEmailPrefs, useToggleInAppPrefs } from "@/hooks/useUsers"
import UserAvatar from "@/components/shared/UserAvatar"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { GraduationCap, Mail, Settings as SettingsIcon, BookOpen, Award, Flame, Plus, X, Lock, User, Bell, Trash2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: courses, isLoading: coursesLoading } = useAllCourses()
  const { data: gamification, isLoading: gamLoading } = useMyGamification()

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<"curriculum" | "settings">("curriculum")

  // Modal States
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)

  // Edit Profile fields
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [gpa] = useState(user?.gpa?.toString() || "")
  const [academicYear, setAcademicYear] = useState(user?.academicYear?.toString() || "")
  const [currentSemester, setCurrentSemester] = useState(user?.currentSemester?.toString() || "")
  const [department, setDepartment] = useState(user?.department || "")

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Add Course fields
  const [newCourseCode, setNewCourseCode] = useState("")
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseYear, setNewCourseYear] = useState("1")
  const [newCourseSemester, setNewCourseSemester] = useState("1")
  const [newCourseGrade, setNewCourseGrade] = useState("")

  // Notification toggles local states
  const [emailNotifs, setEmailNotifs] = useState(() => {
    const val = localStorage.getItem("emailNotifs")
    return val === null ? true : val === "true"
  })
  const [inAppNotifs, setInAppNotifs] = useState(() => {
    const val = localStorage.getItem("inAppNotifs")
    return val === null ? true : val === "true"
  })

  // Modal for editing grade
  const [editingCourse, setEditingCourse] = useState<{ id: string; courseName: string; grade?: string } | null>(null)
  const [editingGrade, setEditingGrade] = useState("")

  // Hooks
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const toggleEmailMutation = useToggleEmailPrefs()
  const toggleInAppMutation = useToggleInAppPrefs()

  const registerCourseMutation = useRegisterCourse()
  const deleteCourseMutation = useDeleteCourseRegistration()
  const updateCourseMutation = useUpdateCourseRegistration()

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty")
      return
    }

    updateProfileMutation.mutate(
      {
        fullName,
        bio: bio || undefined,
        academicYear: academicYear ? parseInt(academicYear) : undefined,
        currentSemester: currentSemester ? parseInt(currentSemester) : undefined,
        department: department || undefined,
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

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully!")
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
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

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      toast.error("Course name and code are required")
      return
    }

    registerCourseMutation.mutate(
      {
        courseCode: newCourseCode,
        courseName: newCourseName,
        academicYear: parseInt(newCourseYear),
        semester: parseInt(newCourseSemester),
      },
      {
        onSuccess: () => {
          toast.success("Course registered successfully!")
          setNewCourseCode("")
          setNewCourseName("")
          setNewCourseGrade("")
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

  const handleMarkCourseCompleted = (courseId: string, courseName: string, currentGrade: string | undefined) => {
    setEditingCourse({ id: courseId, courseName, grade: currentGrade })
    setEditingGrade(currentGrade || "")
  }

  const handleEditGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    updateCourseMutation.mutate(
      {
        id: editingCourse.id,
        body: {
          grade: editingGrade.trim() || undefined,
          result: editingGrade.trim() ? 1.0 : 0.0,
          isCurrent: !editingGrade.trim(),
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
    })
  }

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
          Academic <span className="font-semibold">Profile</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-light max-w-2xl text-sm leading-relaxed">
          Manage your student credentials, review registered modules, and analyze performance calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Profile Card Summary / Left */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs flex flex-col items-center text-center space-y-4">
            <UserAvatar className="h-20 w-20 ring-2 ring-neutral-200 dark:ring-neutral-800" fallbackClassName="text-xl" />
            
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{user?.fullName || "N/A"}</h3>
              {gamification && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Level {gamification.level}
                </span>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-455 font-light leading-relaxed max-w-xs line-clamp-3">
                {user?.bio || "No student bio provided."}
              </p>
            </div>

            {/* Profile Meta List */}
            <div className="w-full pt-4 border-t border-neutral-100 dark:border-neutral-900 text-left space-y-3 text-xs text-neutral-500 dark:text-neutral-450">
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span>{user?.email || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="h-4 w-4 text-neutral-400" />
                <span>ID: {user?.studentId || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <SettingsIcon className="h-4 w-4 text-neutral-400" />
                <span>Dept: {user?.department || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Gamification Card */}
          {gamLoading ? (
            <LoadingState message="Loading stats…" className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" />
          ) : gamification ? (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
                <Award className="h-4 w-4 text-neutral-450 dark:text-neutral-500" />
                <span>Gamification Metrics</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">XP Points</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.xpPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Total Posts</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Total Answers</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.totalAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400">Streak</span>
                  <div className="flex items-center space-x-1.5 p-1 px-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800">
                    <Flame className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-200" />
                    <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">{gamification.currentStreakDays}d</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Section: Sub-Tabs layout */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sub-Tabs Selector */}
          <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <button
              onClick={() => setActiveSubTab("curriculum")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                activeSubTab === "curriculum"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-450"
              }`}
            >
              Academic Curriculum
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                activeSubTab === "settings"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-450"
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
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-xs">
                  <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold tracking-wide uppercase">Cumulative GPA</span>
                  <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">{user?.gpa != null ? user.gpa.toFixed(2) : "N/A"}</p>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block mt-0.5">{user?.department || "N/A"}</span>
                </div>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-xs">
                  <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold tracking-wide uppercase">Semester</span>
                  <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">{user?.currentSemester ?? "N/A"}</p>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block mt-0.5">Year {user?.academicYear ?? "N/A"}</span>
                </div>
              </div>

              {/* Registered Curriculum Modules */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center space-x-2">
                    <BookOpen className="h-4.5 w-4.5 text-neutral-400" />
                    <span>Registered Modules</span>
                  </h3>
                  <button
                    onClick={() => setIsAddCourseOpen(true)}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-3 py-1.5 text-[10px] font-semibold hover:opacity-90 active:scale-98 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Register Module</span>
                  </button>
                </div>

                {coursesLoading ? (
                  <LoadingState message="Loading modules…" />
                ) : !courses || courses.length === 0 ? (
                  <EmptyState title="No courses registered" description="Register course modules to populate your curriculum progress." />
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-900 text-xs">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10 transition-colors">
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">{course.courseName}</p>
                          <p className="text-[10px] text-neutral-450 dark:text-neutral-550 font-medium">
                            Code: <span className="font-semibold uppercase">{course.courseCode}</span> • Year {course.academicYear} • Semester {course.semester}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <button
                            onClick={() => handleMarkCourseCompleted(course.id, course.courseName, course.grade)}
                            className="inline-flex items-center space-x-1 p-1 px-2.5 rounded-md border border-neutral-200 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50"
                          >
                            <span>Grade: {course.grade || "Enrolled"}</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 rounded-md border border-neutral-200 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeSubTab === "settings" && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Profile details config form */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-200 flex items-center space-x-2">
                  <User className="h-4.5 w-4.5" />
                  <span>Academic Details</span>
                </h3>
                
                <form onSubmit={handleUpdateProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Cumulative GPA</label>
                    <input
                      type="text"
                      value={gpa || "N/A"}
                      readOnly
                      disabled
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-75"
                    />
                    <p className="text-[9px] text-neutral-400 font-light">Calculated automatically from your registered modules.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Academic Year</label>
                      <input
                        type="number"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Semester</label>
                      <input
                        type="number"
                        value={currentSemester}
                        onChange={(e) => setCurrentSemester(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="col-span-full space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Bio / Academic Target</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Share your research interests or study path details..."
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="col-span-full flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Notification Prefs toggles */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-200 flex items-center space-x-2">
                  <Bell className="h-4.5 w-4.5" />
                  <span>Notification Subscriptions</span>
                </h3>
                
                <div className="space-y-3.5 border-t border-neutral-100 dark:border-neutral-900 pt-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">Email Bulletins</p>
                      <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-light">Send digests on answer acceptances and shared sheets.</span>
                    </div>
                    <button
                      onClick={handleToggleEmail}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        emailNotifs ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-neutral-950 transition-transform ${
                          emailNotifs ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">In-App Alerts</p>
                      <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-light">Show pop-up bells when you receive upvotes or comments.</span>
                    </div>
                    <button
                      onClick={handleToggleInApp}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        inAppNotifs ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-neutral-950 transition-transform ${
                          inAppNotifs ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password update form */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-200 flex items-center space-x-2">
                  <Lock className="h-4.5 w-4.5" />
                  <span>Update Password Credentials</span>
                </h3>
                
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Register Module</h3>
              <button onClick={() => setIsAddCourseOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourseSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Course Name</label>
                <input 
                  type="text" 
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Course Code</label>
                  <input 
                    type="text" 
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. CS-420"
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Grade achieved (Optional)</label>
                  <input 
                    type="text" 
                    value={newCourseGrade}
                    onChange={(e) => setNewCourseGrade(e.target.value)}
                    placeholder="Leave empty if currently enrolled"
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Academic Year</label>
                  <select
                    value={newCourseYear}
                    onChange={(e) => setNewCourseYear(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden bg-white dark:bg-neutral-950"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Semester</label>
                  <select
                    value={newCourseSemester}
                    onChange={(e) => setNewCourseSemester(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden bg-white dark:bg-neutral-950"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={registerCourseMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Update Course Grade</h3>
              <button onClick={() => setEditingCourse(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditGradeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                  Update your grade for <span className="font-semibold text-neutral-900 dark:text-white">{editingCourse.courseName}</span>
                </p>
                <p className="text-[10px] text-neutral-450">
                  Entering a grade will automatically mark this module as completed. Leave it empty to keep it as currently enrolled.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Letter Grade</label>
                <input 
                  type="text" 
                  value={editingGrade}
                  onChange={(e) => setEditingGrade(e.target.value)}
                  placeholder="e.g. A, B+, C"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setEditingCourse(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updateCourseMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
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
