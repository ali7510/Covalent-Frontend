import { useState } from "react"
import { Trophy, Award, Flame, Search, GraduationCap } from "lucide-react"
import { useAuth } from "@/features/auth/AuthContext"
import { useSystemLeaderboard, useMyGamification } from "@/hooks/useGamification"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { data: leaderboard, isLoading: lbLoading } = useSystemLeaderboard()
  const { data: gamification } = useMyGamification()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeaderboard = leaderboard
    ? leaderboard.filter((student) =>
        student.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : []

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
          Academic <span className="font-[510]">Leaderboard</span>
        </h1>
        <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
          See where you stand in the Covalent community. Earn experience points (XP) by contributing questions, answers, and study notes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Leaderboard Table List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-md border border-border bg-card overflow-hidden shadow-card-light dark:shadow-card-dark">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-[14px] font-[510] text-foreground flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Global XP Standings</span>
              </h3>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find student..." 
                  className="w-full rounded-md border border-border pl-8 pr-2.5 py-1.5 text-[12px] bg-background text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Standings List */}
            {lbLoading ? (
              <LoadingState message="Loading leaderboard…" />
            ) : filteredLeaderboard.length === 0 ? (
              <EmptyState
                icon={<Trophy className="h-6 w-6 text-muted-foreground" />}
                title="No leaderboard data"
                description={searchQuery.trim() ? "No students matching your search criteria." : "Start contributing to appear on the leaderboard."}
              />
            ) : (
              <div className="divide-y divide-border">
                {filteredLeaderboard.map((student) => {
                  const isSelf = student.userId === user?.id
                  return (
                    <div 
                      key={student.rank} 
                      className={`flex items-center justify-between p-4 group transition-colors ${
                        isSelf 
                          ? "bg-secondary/50" 
                          : "hover:bg-secondary/20"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Rank Badge */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-[510]">
                          {student.rank === 1 ? (
                            <span className="text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full">1st</span>
                          ) : student.rank === 2 ? (
                            <span className="text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">2nd</span>
                          ) : student.rank === 3 ? (
                            <span className="text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">3rd</span>
                          ) : (
                            <span className="text-muted-foreground">{student.rank}</span>
                          )}
                        </div>

                        {/* Student Info */}
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary border border-border">
                            <GraduationCap className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className={`text-[12px] font-[510] ${isSelf ? "text-foreground" : "text-foreground"}`}>
                              {student.fullName}
                              {isSelf && <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-wide">You</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Level {student.level} Scholar</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-[12px] font-[510] text-foreground">{student.xpPoints.toLocaleString()} XP</p>
                          <p className="text-[9px] text-muted-foreground tracking-wide uppercase">Total Points</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Showcase Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Stats */}
          {gamification && (
            <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
              <h3 className="text-[14px] font-[510] text-foreground">Your Stats</h3>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XP Points</span>
                  <span className="font-[510] text-foreground">{gamification.xpPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-[510] text-foreground">{gamification.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Streak</span>
                  <div className="flex items-center space-x-1.5 p-1 px-2.5 rounded-md bg-secondary border border-border">
                    <Flame className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-[10px] font-[510] text-foreground">{gamification.currentStreakDays}d</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
            <h3 className="text-[14px] font-[510] text-foreground">How to Earn XP</h3>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-secondary border border-border">
                  <Award className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-[12px] font-[510] text-foreground">Create Good Questions</h4>
                  <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">Submit thoughtful queries in course spaces. Earn +10 XP for every question created, and extra for upvotes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-secondary border border-border">
                  <Flame className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-[12px] font-[510] text-foreground">Provide Best Answers</h4>
                  <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">Resolve peers' doubts. Earn +25 XP when your reply is accepted as the official answer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
