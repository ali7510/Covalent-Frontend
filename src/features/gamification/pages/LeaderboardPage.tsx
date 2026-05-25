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
        <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
          Academic <span className="font-semibold">Leaderboard</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-light max-w-2xl text-sm leading-relaxed">
          See where you stand in the Covalent community. Earn experience points (XP) by contributing questions, answers, and study notes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Leaderboard Table List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-900">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                <span>Global XP Standings</span>
              </h3>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find student..." 
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 pl-8 pr-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Standings List */}
            {lbLoading ? (
              <LoadingState message="Loading leaderboard…" />
            ) : filteredLeaderboard.length === 0 ? (
              <EmptyState
                icon={<Trophy className="h-6 w-6 text-neutral-400" />}
                title="No leaderboard data"
                description={searchQuery.trim() ? "No students matching your search criteria." : "Start contributing to appear on the leaderboard."}
              />
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {filteredLeaderboard.map((student) => {
                  const isSelf = student.userId === user?.id
                  return (
                    <div 
                      key={student.rank} 
                      className={`flex items-center justify-between p-4 group transition-colors ${
                        isSelf 
                          ? "bg-neutral-50/50 dark:bg-neutral-900/50" 
                          : "hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Rank Badge */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                          {student.rank === 1 ? (
                            <span className="text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full">1st</span>
                          ) : student.rank === 2 ? (
                            <span className="text-neutral-600 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full">2nd</span>
                          ) : student.rank === 3 ? (
                            <span className="text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">3rd</span>
                          ) : (
                            <span className="text-neutral-450">{student.rank}</span>
                          )}
                        </div>

                        {/* Student Info */}
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850">
                            <GraduationCap className="h-4.5 w-4.5 text-neutral-600 dark:text-neutral-400" />
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${isSelf ? "text-neutral-950 dark:text-white" : "text-neutral-850 dark:text-neutral-200"}`}>
                              {student.fullName}
                              {isSelf && <span className="ml-1.5 text-[9px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">You</span>}
                            </p>
                            <p className="text-[10px] text-neutral-450 dark:text-neutral-500">Level {student.level} Scholar</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{student.xpPoints.toLocaleString()} XP</p>
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 tracking-wide uppercase">Total Points</p>
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
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Your Stats</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">XP Points</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.xpPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Level</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-200">{gamification.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400">Current Streak</span>
                  <div className="flex items-center space-x-1.5 p-1 px-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800">
                    <Flame className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-200" />
                    <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">{gamification.currentStreakDays}d</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">How to Earn XP</h3>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <Award className="h-4 w-4 text-neutral-850 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-850 dark:text-neutral-300">Create Good Questions</h4>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-light leading-relaxed">Submit thoughtful queries in course spaces. Earn +10 XP for every question created, and extra for upvotes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <Flame className="h-4 w-4 text-neutral-850 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-850 dark:text-neutral-300">Provide Best Answers</h4>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-light leading-relaxed">Resolve peers' doubts. Earn +25 XP when your reply is accepted as the official answer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
