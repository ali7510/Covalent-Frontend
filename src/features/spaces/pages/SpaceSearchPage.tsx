import { useState, useEffect } from "react"
import { Search, Compass, Plus, X } from "lucide-react"
import { useActiveSpaces, useSearchSpaces, useCreateSpace, useJoinSpace, useUserSpaces } from "@/hooks/useSpaces"
import SpaceCard from "@/components/shared/SpaceCard"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import type { SpaceResponse } from "@/lib/types"

export default function SpaceSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("ALL")

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [spaceName, setSpaceName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [category, setCategory] = useState<"COLLEGE_COURSE" | "TUTORIAL" | "PROGRAMMING_LANGUAGE" | "FRAMEWORK">("COLLEGE_COURSE")
  const [description, setDescription] = useState("")

  const [conflictSpaces, setConflictSpaces] = useState<SpaceResponse[] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Join hook for conflicts
  const joinMutation = useJoinSpace()
  const { data: mySpaces } = useUserSpaces()

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
    page: 0,
    size: 20,
  }, hasFilter)

  const createSpaceMutation = useCreateSpace()

  const isLoading = hasFilter ? searchLoading : activeLoading
  const spaces = hasFilter ? (searchResult?.content || []) : (activeSpaces?.content || [])

  const resetModal = () => {
    setSpaceName("")
    setCourseCode("")
    setCategory("COLLEGE_COURSE")
    setDescription("")
    setConflictSpaces(null)
    setErrorMsg(null)
    setIsModalOpen(false)
  }

  const handleSubmit = (e: React.FormEvent, force = false) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!spaceName.trim()) {
      setErrorMsg("Space name is required")
      return
    }

   createSpaceMutation.mutate(
      {
        body: {
          name: spaceName,
          category,
          courseCode: category === "COLLEGE_COURSE" ? courseCode : undefined,
          description: description || undefined,
        },
        force,
      },
      {
        onSuccess: (newSpace) => {
          toast.success(`Successfully requested space: ${newSpace.name}`)
          resetModal()
        },
        onError: (err) => {
          if (isAxiosError(err) && err.response?.status === 409) {
            setConflictSpaces(err.response.data.data as SpaceResponse[])
          } else {
            setErrorMsg(isAxiosError(err) ? err.response?.data?.message || "Failed to create space. Please try again." : "Failed to create space. Please try again.")
          }
        },
      }
    )
  }

  const handleJoinConflictSpace = (space: SpaceResponse) => {
    joinMutation.mutate(space.id, {
      onSuccess: () => {
        toast.success(`Successfully joined: ${space.name}`)
        resetModal()
      },
      onError: (err) => {
        toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to join space" : "Failed to join space")
      },
    })
  }

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
            Explore Study <span className="font-semibold">Spaces</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-light max-w-2xl text-sm leading-relaxed">
            Search courses and student clubs, join spaces to collaborate on worksheets, and find verified resources shared by lecturers.
          </p>
        </div>
        
        {/* Request Space Action */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-4 py-2 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-98 transition-all shrink-0 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>Request Space</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-neutral-450 dark:text-neutral-500" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course name, abbreviation, or code (e.g. CS-301)..." 
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 pl-11 pr-4 py-3 text-xs bg-white dark:bg-neutral-950 shadow-xs focus:outline-hidden"
        />
      </div>

      {/* Category Selection Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "COLLEGE_COURSE", "TUTORIAL", "PROGRAMMING_LANGUAGE", "FRAMEWORK"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              activeCategory === cat
                ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-950"
                : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-250"
            }`}
          >
            {cat === "ALL" ? "All Categories" : cat === "COLLEGE_COURSE" ? "COURSE" : cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Study Spaces Card Grid */}
      {isLoading ? (
        <LoadingState message="Loading spaces…" />
      ) : spaces.length === 0 ? (
        <div className="col-span-2">
          <EmptyState
            icon={<Compass className="h-6 w-6 text-neutral-400" />}
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

      {/* Modern Request Space Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-6 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {conflictSpaces ? "Similar Spaces Found" : "Request Study Space"}
              </h3>
              <button 
                onClick={resetModal}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Conflict Spaces Review Layout */}
            {conflictSpaces ? (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  A few spaces with similar course codes or identifiers already exist. Please consider joining one of these existing modules to pool discussions!
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {conflictSpaces.map((space) => {
                    const isJoined = mySpaces?.some(s => s.id === space.id) ?? false;
                    return (
                      <div 
                        key={space.id} 
                        className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">{space.name}</p>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase">{space.category} | {space.memberCount} Members</span>
                        </div>
                        <button
                          onClick={() => handleJoinConflictSpace(space)}
                          disabled={isJoined || joinMutation.isPending}
                          className={`rounded-md px-3 py-1.5 text-[10px] font-semibold border ${
                            isJoined 
                              ? "bg-neutral-100 text-neutral-400 border-neutral-200" 
                              : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90"
                          }`}
                        >
                          {isJoined ? "Member" : "Join"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-neutral-150 dark:border-neutral-900">
                  <button 
                    onClick={() => setConflictSpaces(null)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={createSpaceMutation.isPending}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90"
                  >
                    {createSpaceMutation.isPending ? "Creating..." : "Force Create Anyway"}
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-450">Space Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["COLLEGE_COURSE", "TUTORIAL", "PROGRAMMING_LANGUAGE", "FRAMEWORK"] as const).map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          setCategory(cat)
                          if (cat !== "COLLEGE_COURSE") setCourseCode("")
                        }}
                        className={`py-2 px-1 text-[10px] font-semibold rounded-lg border transition-all duration-200 truncate ${
                          category === cat
                            ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-950"
                            : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-500 hover:text-neutral-900"
                        }`}
                        title={cat.replace("_", " ")}
                      >
                        {cat === "COLLEGE_COURSE" ? "COURSE" : cat.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-450">Space Name</label>
                  <input 
                    type="text" 
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    placeholder="e.g. Distributed Operating Systems"
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>

                {category === "COLLEGE_COURSE" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-450">Course Code</label>
                    <input 
                      type="text" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="e.g. CS-420"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-450">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a short description of the learning goal..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-neutral-150 dark:border-neutral-900">
                  <button 
                    type="button"
                    onClick={resetModal}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createSpaceMutation.isPending}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-50"
                  >
                    {createSpaceMutation.isPending ? "Creating..." : "Request Space"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
