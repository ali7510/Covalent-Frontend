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
      <div className="relative overflow-hidden rounded-md border border-border bg-card p-8 md:p-10 shadow-card-light dark:shadow-card-dark">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-50 pointer-events-none -z-10" />
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[11px] font-[510] text-secondary-foreground">
            Academic Hub
          </span>
          <h1 className="text-[28px] md:text-[32px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
            Welcome back, <span className="font-[510]">{user?.fullName || "Student"}</span>
          </h1>
          <p className="text-muted-foreground font-normal leading-relaxed text-[14px]">
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
              className="rounded-md border border-border bg-card p-5 shadow-card-light dark:shadow-card-dark flex items-center justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">{stat.label}</span>
                <p className="text-[22px] font-[510] tracking-tight text-foreground">{stat.value}</p>
                <span className="text-[11px] text-muted-foreground block">{stat.sub}</span>
              </div>
              <div className="p-3 bg-secondary border border-border rounded-md">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Two-Column Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: My Spaces */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-[15px] leading-[24px] font-[510] text-foreground">My Study Spaces</h3>
              <Link to="/discover" className="text-[12px] text-muted-foreground font-medium hover:text-foreground transition-colors">
                Explore all →
              </Link>
            </div>

            <div className="pt-4">
              {spacesLoading ? (
                <LoadingState message="Loading your spaces…" />
              ) : !spaces || spaces.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="h-6 w-6 text-muted-foreground" />}
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
          <div 
            className="rounded-md text-white p-6 shadow-card-dark relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0E1A3E 0%, #293677 50%, #544BBA 100%)" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50" />
            <h3 className="text-[15px] font-[510] mb-2 relative z-10">Study Spaces Hub</h3>
            <p className="text-[12px] text-white/70 mb-6 font-normal leading-relaxed relative z-10">
              Collaborate on courses, find solutions from peers, and download lecture notes uploaded by instructors.
            </p>
            <Link 
              to="/discover" 
              className="inline-flex items-center space-x-2 rounded-full bg-white text-[#0E1A3E] px-4 py-2 text-[12px] font-[510] hover:bg-white/90 active:scale-98 transition-all relative z-10"
            >
              <span>Explore Spaces</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Gamification Summary */}
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark">
            <h3 className="text-[14px] font-[510] text-foreground mb-4">Activity Summary</h3>
            {gamLoading ? (
              <LoadingState message="Loading stats…" className="p-4" />
            ) : !gamification ? (
              <p className="text-[12px] text-muted-foreground font-normal">No activity data available yet.</p>
            ) : (
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-[510] text-foreground">{gamification.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Answers</span>
                  <span className="font-[510] text-foreground">{gamification.totalAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upvotes Received</span>
                  <span className="font-[510] text-foreground">{gamification.totalUpvotesReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials Shared</span>
                  <span className="font-[510] text-foreground">{gamification.totalMaterialsShared}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}