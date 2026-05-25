import { useAuth } from "@/features/auth/AuthContext"
import { useUserSpaces } from "@/hooks/useSpaces"
import { useMyGamification } from "@/hooks/useGamification"
import SpaceCard from "@/components/shared/SpaceCard"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { 
  GraduationCap, 
  Flame, 
  Award, 
  ArrowRight,
  TrendingUp,
  FolderOpen
} from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  const { user } = useAuth()
  const { data: spaces, isLoading: spacesLoading } = useUserSpaces()
  const { data: gamification, isLoading: gamLoading } = useMyGamification()

  const quickStats = [
    { 
      label: "Active Semester", 
      value: user?.currentSemester ? `Semester ${user.currentSemester}` : "N/A", 
      sub: user?.academicYear ? `Year ${user.academicYear}` : "N/A", 
      icon: GraduationCap 
    },
    { 
      label: "Cumulative GPA", 
      value: user?.gpa != null ? user.gpa.toFixed(2) : "N/A", 
      sub: user?.department || "N/A", 
      icon: TrendingUp 
    },
    { 
      label: "XP Points", 
      value: gamification ? `${gamification.xpPoints.toLocaleString()} XP` : "N/A", 
      sub: gamification ? `Level ${gamification.level}` : "N/A", 
      icon: Award 
    },
    { 
      label: "Daily Streak", 
      value: gamification ? `${gamification.currentStreakDays} Days` : "N/A", 
      sub: gamification?.longestStreakDays ? `Best: ${gamification.longestStreakDays} days` : "N/A", 
      icon: Flame 
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 md:p-10 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-100 dark:bg-neutral-900 rounded-full filter blur-3xl opacity-50 pointer-events-none -z-10" />
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Academic Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-neutral-900 dark:text-neutral-50 leading-none">
            Welcome back, <span className="font-semibold text-neutral-950 dark:text-white">{user?.fullName || "Student"}</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-light leading-relaxed text-sm md:text-base">
            {spaces && spaces.length > 0
              ? `You are a member of ${spaces.length} study space${spaces.length > 1 ? "s" : ""}. Explore discussions and shared materials from your peers.`
              : "Join study spaces to collaborate with your peers on courses, share materials, and earn XP."}
          </p>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div 
              key={idx}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-xs flex items-center justify-between hover:shadow-sm transition-shadow duration-200"
            >
              <div className="space-y-1.5">
                <span className="text-xs text-neutral-450 dark:text-neutral-500 font-medium tracking-wide uppercase">{stat.label}</span>
                <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">{stat.value}</p>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">{stat.sub}</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                <Icon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Two-Column Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: My Spaces */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">My Study Spaces</h3>
              <Link to="/spaces/search" className="text-xs text-neutral-400 dark:text-neutral-500 font-medium hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                Explore all →
              </Link>
            </div>

            <div className="pt-4">
              {spacesLoading ? (
                <LoadingState message="Loading your spaces…" />
              ) : !spaces || spaces.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="h-6 w-6 text-neutral-400" />}
                  title="No spaces joined yet"
                  description="Explore available spaces and join your course groups."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spaces.slice(0, 4).map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Links */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 dark:bg-neutral-950 text-white p-6 shadow-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#3b3b3b_0%,transparent_70%)] opacity-40" />
            <h3 className="text-base font-semibold mb-2 relative z-10">Study Spaces Hub</h3>
            <p className="text-xs text-neutral-400 mb-6 font-light leading-relaxed relative z-10">
              Collaborate on courses, find solutions from peers, and download lecture notes uploaded by instructors.
            </p>
            <Link 
              to="/spaces/search" 
              className="inline-flex items-center space-x-2 rounded-lg bg-white text-neutral-950 px-4 py-2 text-xs font-semibold hover:bg-neutral-100 active:scale-98 transition-all relative z-10"
            >
              <span>Explore Spaces</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Gamification Summary */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Activity Summary</h3>
            {gamLoading ? (
              <LoadingState message="Loading stats…" className="p-4" />
            ) : !gamification ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">No activity data available yet.</p>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Total Posts</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Total Answers</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.totalAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Upvotes Received</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.totalUpvotesReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Materials Shared</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.totalMaterialsShared}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}