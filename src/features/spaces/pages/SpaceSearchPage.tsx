// src/features/spaces/pages/SpaceSearchPage.tsx

import { useState, useEffect } from "react"
import { Search, Compass, Sparkles, Plus } from "lucide-react"
import { useActiveSpaces, useSearchSpaces, useJoinSpace, useUserSpaces } from "@/hooks/useSpaces"
import { useSpaceRecommendations } from "@/hooks/useRecommendations"
import SpaceCard from "@/components/shared/SpaceCard"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import { Link } from "react-router-dom"

export default function SpaceSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<"createdAt" | "memberCount">("createdAt")
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")

  // Join hook
  const joinMutation = useJoinSpace()
  const { data: mySpaces } = useUserSpaces()

  // Recommendations
  const { data: recommendations, isLoading: recsLoading } = useSpaceRecommendations()

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Use search when there's a query or category filter, otherwise get active spaces
  const hasFilter = debouncedQuery.trim() !== "" || activeCategory !== "ALL"
  const { data: activeSpaces, isLoading: activeLoading } = useActiveSpaces(0, 20, !hasFilter)
  const { data: searchResult, isLoading: searchLoading } = useSearchSpaces({
    query: debouncedQuery.trim() || undefined,
    category: activeCategory !== "ALL" ? activeCategory : undefined,
    sortBy,
    sortDir,
    page: 0,
    size: 20,
  }, hasFilter)

  const isLoading = hasFilter ? searchLoading : activeLoading
  const spaces = hasFilter ? (searchResult || []) : (activeSpaces || [])

  const handleJoinRecommended = (spaceId: string, spaceName: string) => {
    const isJoined = mySpaces?.some(s => s.id === spaceId) ?? false
    if (isJoined) {
      toast.info("You're already a member of this space.")
      return
    }
    joinMutation.mutate(spaceId, {
      onSuccess: () => toast.success(`Joined: ${spaceName}`),
      onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to join space" : "Failed to join space"),
    })
  }

  // Only show recommendations when there's no active search filter
  const showRecommendations = !hasFilter && recommendations && recommendations.length > 0

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      {/* FIX: Restructured header to include Create Space button on the right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
            Discover Study <span className="font-[510]">Spaces</span>
          </h1>
          <p className="text-muted-foreground font-normal text-[14px] leading-relaxed">
            Search courses and student clubs, join spaces to collaborate on worksheets, and find verified resources shared by lecturers.
          </p>
        </div>
        <Link
          to="/spaces/create"
          className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-[13px] font-[510] hover:opacity-90 active:scale-98 transition-all shadow-btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Space</span>
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course name, abbreviation, or code (e.g. CS-301)..."
          className="w-full rounded-md border border-border pl-11 pr-4 py-3 text-[13px] bg-card text-foreground shadow-card-light dark:shadow-card-dark focus:outline-none"
        />
      </div>

      {/* Category + Sort row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {(["ALL", "COLLEGE_COURSE", "TUTORIAL", "PROGRAMMING_LANGUAGE", "FRAMEWORK"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-[510] border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat === "COLLEGE_COURSE" ? "COURSE" : cat.replace("_", " ")}
            </button>
          ))}
        </div>
        {/* Order By selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-[510] text-muted-foreground uppercase tracking-wide">Order by</span>
          <select
            value={`${sortBy}_${sortDir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split("_") as ["createdAt" | "memberCount", "desc" | "asc"]
              setSortBy(by)
              setSortDir(dir)
            }}
            className="rounded-md border border-border bg-card text-foreground text-[12px] font-[510] px-2.5 py-1.5 focus:outline-none hover:bg-secondary transition-colors"
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="memberCount_desc">Most Members</option>
            <option value="memberCount_asc">Least Members</option>
          </select>
        </div>
      </div>

      {/* Recommended Spaces Section (shown when no active filter) */}
      {showRecommendations && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-[14px] font-[510] text-foreground">Recommended for You</h2>
          </div>
          {recsLoading ? (
            <LoadingState message="Loading recommendations…" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations!.map(({ space, reasons, score }) => {
                const isJoined = mySpaces?.some(s => s.id === space.id) ?? false
                return (
                  <div
                    key={space.id}
                    className="rounded-md border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 p-4 space-y-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-[510] text-foreground">{space.name}</p>
                        {space.courseCode && (
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{space.courseCode}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-[510] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        {Math.round(score * 100)}% match
                      </span>
                    </div>
                    {reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {reasons.slice(0, 3).map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">{space.memberCount} members</span>
                      <button
                        onClick={() => handleJoinRecommended(space.id, space.name)}
                        disabled={isJoined || joinMutation.isPending}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-[510] transition-all ${
                          isJoined
                            ? "bg-secondary text-muted-foreground border border-border cursor-default"
                            : "bg-primary text-primary-foreground hover:opacity-90 active:scale-98"
                        }`}
                      >
                        {isJoined ? "Joined" : "Join Space"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <hr className="border-border" />
        </div>
      )}

      {/* All / Searched Spaces Grid */}
      <div className="space-y-4">
        {!hasFilter && (
          <h2 className="text-[14px] font-[510] text-foreground">
            {activeCategory === "ALL" ? "All Active Spaces" : (activeCategory as string).replace("_", " ")}
          </h2>
        )}
        {isLoading ? (
          <LoadingState message="Loading spaces…" />
        ) : spaces.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              icon={<Compass className="h-6 w-6 text-muted-foreground" />}
              title="No study spaces found"
              description={searchQuery ? "Try modifying your query or category filters." : "No spaces are available yet."}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}