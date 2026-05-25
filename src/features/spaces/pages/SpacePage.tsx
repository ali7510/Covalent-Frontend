import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { isAxiosError } from "axios"
import { Users, FileText, Plus, X, Trophy, Bookmark } from "lucide-react"
import { useSpace, useUserSpaces, useJoinSpace, useLeaveSpace } from "@/hooks/useSpaces"
import { useSpacePosts, useCreatePost } from "@/hooks/usePosts"
import {
  useSpaceMaterials,
  useBookmarkedMaterials,
  useUploadFile,
  useShareLink,
  useBookmarkMaterial,
  useRemoveBookmarkMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from "@/hooks/useMaterials"
import { useSpaceLeaderboard } from "@/hooks/useGamification"
import { downloadMaterial } from "@/services/materials"
import { useAuth } from "@/features/auth/AuthContext"
import PostCard from "@/components/shared/PostCard"
import FileCard from "@/components/shared/FileCard"
import LinkCard from "@/components/shared/LinkCard"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { toast } from "sonner"

export default function SpacePage() {
  const { spaceId } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"posts" | "materials" | "leaderboard">("posts")
  const [materialSubTab, setMaterialSubTab] = useState<"all" | "files" | "links" | "bookmarked">("all")

  // Pagination states
  const [postsPage, setPostsPage] = useState(0)
  const [materialsPage, setMaterialsPage] = useState(0)
  const postsPageSize = 20
  const materialsPageSize = 20

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  
  // Edit Resource Modal State
  const [editingMaterial, setEditingMaterial] = useState<{ id: string; title: string; description: string; resourceType: string; url?: string } | null>(null)
  const [editMaterialTitle, setEditMaterialTitle] = useState("")
  const [editMaterialDesc, setEditMaterialDesc] = useState("")
  const [editMaterialUrl, setEditMaterialUrl] = useState("")

  // Form Fields
  const [postTitle, setPostTitle] = useState("")
  const [postBody, setPostBody] = useState("")
  const [resourceTitle, setResourceTitle] = useState("")
  const [resourceType, setResourceType] = useState<"FILE" | "LINK">("FILE")
  const [resourceUrl, setResourceUrl] = useState("")
  const [resourceFile, setResourceFile] = useState<File | null>(null)
  const [resourceDesc, setResourceDesc] = useState("")

  // API State Fetching
  const { data: space, isLoading: spaceLoading } = useSpace(spaceId)
  const { data: postsPageData, isLoading: postsLoading } = useSpacePosts(spaceId, postsPage, postsPageSize)
  const { data: materials, isLoading: materialsLoading } = useSpaceMaterials(spaceId, materialsPage, materialsPageSize)
  const { data: bookmarkedMaterials, isLoading: bookmarksLoading } = useBookmarkedMaterials(spaceId, 0, 100)
  const { data: leaderboard, isLoading: lbLoading } = useSpaceLeaderboard(spaceId)
  const { data: mySpaces } = useUserSpaces()

  // Mutations
  const joinMutation = useJoinSpace()
  const leaveMutation = useLeaveSpace()
  const createPostMutation = useCreatePost(spaceId)
  const uploadFileMutation = useUploadFile(spaceId)
  const shareLinkMutation = useShareLink(spaceId)
  const addBookmarkMutation = useBookmarkMaterial(spaceId)
  const removeBookmarkMutation = useRemoveBookmarkMaterial(spaceId)
  const updateMaterialMutation = useUpdateMaterial(spaceId)
  const deleteMaterialMutation = useDeleteMaterial(spaceId)

  const posts = postsPageData || []
  const materialsList = materials?.content || []
  const bookmarkedList = bookmarkedMaterials?.content || []

  // Derived lists
  const files = materialsList.filter((m) => m.resourceType !== "LINK")
  const links = materialsList.filter((m) => m.resourceType === "LINK")
  const isJoined = mySpaces?.some((s) => s.id === spaceId) ?? false
  const isTransitionPending = joinMutation.isPending || leaveMutation.isPending

  if (spaceLoading) {
    return <LoadingState message="Loading space details…" />
  }

  if (!space) {
    return (
      <EmptyState
        title="Space not found"
        description="The space you're looking for doesn't exist or has been removed."
      />
    )
  }

  const handleJoinToggle = () => {
    if (isJoined) {
      leaveMutation.mutate(space.id, {
        onSuccess: () => toast.success(`Left space: ${space.name}`),
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to leave space" : "Failed to leave space"),
      })
    } else {
      joinMutation.mutate(space.id, {
        onSuccess: () => toast.success(`Joined space: ${space.name}`),
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to join space" : "Failed to join space"),
      })
    }
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postBody.trim()) {
      toast.error("Please fill in all post fields")
      return
    }

    createPostMutation.mutate(
      { title: postTitle, body: postBody },
      {
        onSuccess: () => {
          toast.success("Discussion post created!")
          setPostTitle("")
          setPostBody("")
          setIsPostModalOpen(false)
        },
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to submit post" : "Failed to submit post"),
      }
    )
  }

  const handleShareResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceTitle.trim()) {
      toast.error("Resource title is required")
      return
    }

    if (resourceType === "LINK") {
      if (!resourceUrl.trim()) {
        toast.error("Please provide a link URL")
        return
      }
      shareLinkMutation.mutate(
        { title: resourceTitle, url: resourceUrl, description: resourceDesc || undefined },
        {
          onSuccess: () => {
            toast.success("Reference link shared!")
            resetResourceForm()
          },
          onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to share link" : "Failed to share link"),
        }
      )
    } else {
      if (!resourceFile) {
        toast.error("Please select a file to upload")
        return
      }
      uploadFileMutation.mutate(
        { title: resourceTitle, file: resourceFile, description: resourceDesc || undefined },
        {
          onSuccess: () => {
            toast.success("Lecture worksheet uploaded!")
            resetResourceForm()
          },
          onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to upload file" : "Failed to upload file"),
        }
      )
    }
  }

  const resetResourceForm = () => {
    setResourceTitle("")
    setResourceUrl("")
    setResourceFile(null)
    setResourceDesc("")
    setIsResourceModalOpen(false)
  }

  const handleToggleBookmark = (materialId: string, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      removeBookmarkMutation.mutate(materialId, {
        onSuccess: () => toast.success("Bookmark removed"),
        onError: () => toast.error("Failed to remove bookmark"),
      })
    } else {
      addBookmarkMutation.mutate(materialId, {
        onSuccess: () => toast.success("Material bookmarked!"),
        onError: () => toast.error("Failed to bookmark material"),
      })
    }
  }

  // Edit Material Handler
  const handleEditMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMaterial) return
    if (!editMaterialTitle.trim()) {
      toast.error("Title cannot be empty")
      return
    }

    updateMaterialMutation.mutate(
      {
        materialId: editingMaterial.id,
        body: {
          title: editMaterialTitle,
          description: editMaterialDesc || undefined,
          url: editingMaterial.resourceType === "LINK" ? editMaterialUrl : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Resource updated successfully!")
          setEditingMaterial(null)
        },
        onError: () => toast.error("Failed to update resource"),
      }
    )
  }

  // Delete Material Handler
  const handleDeleteMaterial = (materialId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    deleteMaterialMutation.mutate(materialId, {
      onSuccess: () => {
        toast.success("Resource deleted successfully")
      },
      onError: () => toast.error("Failed to delete resource"),
    })
  }

  // Download File Integration
  const handleDownloadFile = async (materialId: string) => {
    try {
      toast.info("Preparing download...")
      const blob = await downloadMaterial(materialId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const mat = materialsList.find((m) => m.id === materialId)
      link.setAttribute("download", mat?.title || "download")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Download started successfully!")
    } catch {
      toast.error("Failed to download resource")
    }
  }

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Navigation breadcrumb */}
      <Link 
        to="/spaces/search" 
        className="inline-flex items-center text-xs font-semibold text-neutral-450 dark:text-neutral-500 hover:text-neutral-850"
      >
        <span>← Back to Explore Spaces</span>
      </Link>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neutral-100 dark:bg-neutral-900 rounded-full filter blur-3xl opacity-40 pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3.5 max-w-xl">
            {space.courseCode && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Module {space.courseCode}
              </span>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
              {space.name}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-455 font-light leading-relaxed text-xs sm:text-sm">
              {space.description || "No description available."}
            </p>
          </div>

          {/* Action buttons & Stats Badges */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3.5 shrink-0 self-start">
            <button
              onClick={handleJoinToggle}
              disabled={isTransitionPending}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border active:scale-98 transition-all text-center ${
                isJoined
                  ? "bg-neutral-955 text-white border-neutral-955 dark:bg-white dark:text-neutral-955 dark:border-white hover:opacity-90"
                  : "bg-white dark:bg-neutral-955 border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 text-neutral-900 dark:text-white"
              }`}
            >
              {isJoined ? "Leave Space" : "Join Space"}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-450">
                <Users className="h-4 w-4 text-neutral-450" />
                <span>{space.memberCount} Members</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-455">
                <FileText className="h-4 w-4 text-neutral-455" />
                <span>{materials?.totalElements ?? 0} Resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Tab Feeds */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Custom Multi-Tabs */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              {(["posts", "materials", "leaderboard"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-455"
                  }`}
                >
                  {tab === "posts" ? "Discussions" : tab === "materials" ? "Resources" : "Leaderboard"}
                </button>
              ))}
            </div>

            {/* Float dialog creators */}
            {isJoined && activeTab !== "leaderboard" && (
              <button
                onClick={() => {
                  if (activeTab === "posts") setIsPostModalOpen(true)
                  else setIsResourceModalOpen(true)
                }}
                className="inline-flex items-center space-x-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-3.5 py-1.5 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-98 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{activeTab === "posts" ? "New Post" : "Share Resource"}</span>
              </button>
            )}
          </div>

          {/* DISCUSSIONS TAB */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {postsLoading ? (
                <LoadingState message="Loading discussions…" />
              ) : posts.length === 0 ? (
                <EmptyState title="No discussions yet" description="Be the first to start a conversation in this space." />
              ) : (
                <>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.postId} post={post} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-4 mt-4 text-xs font-semibold">
                    <button
                      onClick={() => setPostsPage((p) => Math.max(0, p - 1))}
                      disabled={postsPage === 0}
                      className="px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-neutral-450 font-normal">Page {postsPage + 1}</span>
                    <button
                      onClick={() => setPostsPage((p) => p + 1)}
                      disabled={posts.length < postsPageSize}
                      className="px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === "materials" && (
            <div className="space-y-6 animate-fade-in">
              {/* Materials Filter Sub-Tabs */}
              <div className="flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-900 pb-2.5">
                {(["all", "files", "links", "bookmarked"] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setMaterialSubTab(sub)
                      setMaterialsPage(0)
                    }}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all ${
                      materialSubTab === sub
                        ? "bg-neutral-950 border-neutral-950 text-white dark:bg-white dark:border-white dark:text-neutral-950"
                        : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-850"
                    }`}
                  >
                    {sub === "all" ? "All resources" : sub === "files" ? "Files" : sub === "links" ? "Reference URLs" : "Bookmarked"}
                  </button>
                ))}
              </div>

              {/* Materials Display */}
              {materialsLoading || bookmarksLoading ? (
                <LoadingState message="Loading resources…" />
              ) : (
                <div className="space-y-4">
                  {materialSubTab === "all" && materialsList.length === 0 && (
                    <EmptyState title="No resources shared yet" description="Upload study slides or share references." />
                  )}
                  {materialSubTab === "files" && files.length === 0 && (
                    <EmptyState title="No worksheet files yet" description="Lecture sheets or docs will appear here." />
                  )}
                  {materialSubTab === "links" && links.length === 0 && (
                    <EmptyState title="No references yet" description="Course external URLs will appear here." />
                  )}
                  {materialSubTab === "bookmarked" && bookmarkedList.length === 0 && (
                    <EmptyState title="No bookmarks yet" description="Bookmark materials to pin them under this folder." />
                  )}

                  {/* Render All / Filtered Lists */}
                  {materialSubTab === "all" && (
                    <>
                      {files.map((file) => (
                        <div key={file.id} className="relative group">
                          <FileCard 
                            material={file} 
                            isUploader={user?.id === file.uploadedById}
                            onDownload={handleDownloadFile}
                            onEdit={(m) => {
                              setEditingMaterial({ id: m.id, title: m.title, description: m.description || "", resourceType: m.resourceType })
                              setEditMaterialTitle(m.title)
                              setEditMaterialDesc(m.description || "")
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                          {isJoined && (
                            <button 
                              onClick={() => handleToggleBookmark(file.id, file.isBookmarked ?? false)}
                              className="absolute top-4 right-24 p-1 text-neutral-400 hover:text-neutral-800"
                            >
                              <Bookmark className={`h-4.5 w-4.5 ${file.isBookmarked ? "fill-neutral-950 text-neutral-950 dark:fill-white dark:text-white" : ""}`} />
                            </button>
                          )}
                        </div>
                      ))}
                      {links.map((link) => (
                        <div key={link.id} className="relative group">
                          <LinkCard 
                            material={link} 
                            isUploader={user?.id === link.uploadedById}
                            onEdit={(m) => {
                              setEditingMaterial({ id: m.id, title: m.title, description: m.description || "", resourceType: m.resourceType, url: m.url })
                              setEditMaterialTitle(m.title)
                              setEditMaterialDesc(m.description || "")
                              setEditMaterialUrl(m.url)
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                          {isJoined && (
                            <button 
                              onClick={() => handleToggleBookmark(link.id, link.isBookmarked ?? false)}
                              className="absolute top-4 right-14 p-1 text-neutral-400 hover:text-neutral-800"
                            >
                              <Bookmark className={`h-4.5 w-4.5 ${link.isBookmarked ? "fill-neutral-950 text-neutral-950 dark:fill-white dark:text-white" : ""}`} />
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {materialSubTab === "files" && (
                    files.map((file) => (
                      <div key={file.id} className="relative group">
                        <FileCard 
                          material={file} 
                          isUploader={user?.id === file.uploadedById}
                          onDownload={handleDownloadFile}
                          onEdit={(m) => {
                            setEditingMaterial({ id: m.id, title: m.title, description: m.description || "", resourceType: m.resourceType })
                            setEditMaterialTitle(m.title)
                            setEditMaterialDesc(m.description || "")
                          }}
                          onDelete={handleDeleteMaterial}
                        />
                        {isJoined && (
                          <button 
                            onClick={() => handleToggleBookmark(file.id, file.isBookmarked ?? false)}
                            className="absolute top-4 right-24 p-1 text-neutral-400 hover:text-neutral-800"
                          >
                            <Bookmark className={`h-4.5 w-4.5 ${file.isBookmarked ? "fill-neutral-950 text-neutral-950 dark:fill-white dark:text-white" : ""}`} />
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {materialSubTab === "links" && (
                    links.map((link) => (
                      <div key={link.id} className="relative group">
                        <LinkCard 
                          material={link} 
                          isUploader={user?.id === link.uploadedById}
                          onEdit={(m) => {
                            setEditingMaterial({ id: m.id, title: m.title, description: m.description || "", resourceType: m.resourceType, url: m.url })
                            setEditMaterialTitle(m.title)
                            setEditMaterialDesc(m.description || "")
                            setEditMaterialUrl(m.url)
                          }}
                          onDelete={handleDeleteMaterial}
                        />
                        {isJoined && (
                          <button 
                            onClick={() => handleToggleBookmark(link.id, link.isBookmarked ?? false)}
                            className="absolute top-4 right-14 p-1 text-neutral-400 hover:text-neutral-800"
                          >
                            <Bookmark className={`h-4.5 w-4.5 ${link.isBookmarked ? "fill-neutral-950 text-neutral-950 dark:fill-white dark:text-white" : ""}`} />
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {materialSubTab === "bookmarked" && (
                    bookmarkedList.map((bm) => (
                      <div key={bm.id} className="relative group">
                        {bm.resourceType === "LINK" ? (
                          <LinkCard 
                            material={bm} 
                            isUploader={user?.id === bm.uploadedById}
                            onEdit={(m) => {
                              setEditingMaterial({ id: m.id, title: m.title, description: m.description || "", resourceType: m.resourceType, url: m.url })
                              setEditMaterialTitle(m.title)
                              setEditMaterialDesc(m.description || "")
                              setEditMaterialUrl(m.url)
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                        ) : (
                          <FileCard 
                            material={bm} 
                            isUploader={user?.id === bm.uploadedById}
                            onDownload={handleDownloadFile}
                            onEdit={(m) => {
                              setEditingMaterial({ id: m.id, title: m.title, description: m.description || "", resourceType: m.resourceType })
                              setEditMaterialTitle(m.title)
                              setEditMaterialDesc(m.description || "")
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                        )}
                        <button 
                          onClick={() => handleToggleBookmark(bm.id, true)}
                          className="absolute top-4 right-24 p-1 text-neutral-950 hover:text-neutral-500 dark:text-white"
                        >
                          <Bookmark className="h-4.5 w-4.5 fill-neutral-950 text-neutral-950 dark:fill-white dark:text-white" />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Pagination Controls for Materials */}
                  {materialSubTab !== "bookmarked" && materials && materials.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-4 mt-4 text-xs font-semibold">
                      <button
                        onClick={() => setMaterialsPage((p) => Math.max(0, p - 1))}
                        disabled={materialsPage === 0}
                        className="px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-neutral-450 font-normal">
                        Page {materialsPage + 1} of {materials.totalPages}
                      </span>
                      <button
                        onClick={() => setMaterialsPage((p) => p + 1)}
                        disabled={materialsPage + 1 >= materials.totalPages}
                        className="px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === "leaderboard" && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
                <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center space-x-2">
                    <Trophy className="h-4 w-4" />
                    <span>Space Contributors</span>
                  </h3>
                </div>

                {lbLoading ? (
                  <LoadingState message="Loading rankings…" />
                ) : !leaderboard || leaderboard.length === 0 ? (
                  <EmptyState title="No active contributors" description="Submit answers and post resources to claim first place!" />
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-900 text-xs">
                    {leaderboard.map((member, index) => (
                      <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-neutral-50/50">
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-neutral-455 w-6 text-center">{index + 1}</span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                            {member.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{member.fullName}</p>
                            <span className="text-[10px] text-neutral-450 dark:text-neutral-550 uppercase font-light">Level {member.level} Scholar</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900 dark:text-white">{member.xpPoints} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Space Info & Resources */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Space Information</h3>
            <div className="space-y-3 text-xs border-t border-neutral-100 dark:border-neutral-900 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Category</span>
                <span className="font-semibold text-neutral-850 dark:text-neutral-200 capitalize">{space.category || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Course Code</span>
                <span className="font-semibold text-neutral-850 dark:text-neutral-200 uppercase">{space.courseCode || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Created By</span>
                <span className="font-semibold text-neutral-850 dark:text-neutral-200">{space.createdByName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                <span className="font-semibold text-neutral-850 dark:text-neutral-200">{space.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Compose Discussion Post</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Post Title</label>
                <input 
                  type="text" 
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Question on Lecture 3 slide 14"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden bg-neutral-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Content Body</label>
                <textarea 
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Elaborate your doubt or detail references here..."
                  rows={5}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden resize-none bg-neutral-50/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createPostMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
                >
                  {createPostMutation.isPending ? "Posting..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE RESOURCE MODAL */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Share Resource</h3>
              <button onClick={resetResourceForm} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleShareResource} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Resource Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["FILE", "LINK"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setResourceType(type)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        resourceType === type
                          ? "bg-neutral-950 border-neutral-950 text-white dark:bg-white dark:border-white dark:text-neutral-955 animate-pulse-subtle"
                          : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-550 hover:text-neutral-900"
                      }`}
                    >
                      {type === "FILE" ? "Upload File" : "Share URL Link"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Resource Title</label>
                <input 
                  type="text" 
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder={resourceType === "FILE" ? "e.g. Calculus midterm solutionsheet" : "e.g. Recommended video references"}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden bg-neutral-50/20"
                />
              </div>

              {resourceType === "LINK" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Reference URL Link</label>
                  <input 
                    type="url" 
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://example.com/slide"
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden bg-neutral-50/20"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Lecture sheet file (PDF, DOCX, TXT, MD)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-855 rounded-lg p-2 focus:outline-hidden bg-neutral-50/20"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Description (Optional)</label>
                <textarea 
                  value={resourceDesc}
                  onChange={(e) => setResourceDesc(e.target.value)}
                  placeholder="Provide a small brief explaining the material contents..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden resize-none bg-neutral-50/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={resetResourceForm}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadFileMutation.isPending || shareLinkMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
                >
                  {uploadFileMutation.isPending || shareLinkMutation.isPending ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESOURCE MODAL */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Edit Resource</h3>
              <button onClick={() => setEditingMaterial(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditMaterialSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Resource Title</label>
                <input 
                  type="text" 
                  value={editMaterialTitle}
                  onChange={(e) => setEditMaterialTitle(e.target.value)}
                  placeholder="Resource title"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden bg-neutral-50/20"
                />
              </div>

              {editingMaterial.resourceType === "LINK" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Reference URL Link</label>
                  <input 
                    type="url" 
                    value={editMaterialUrl}
                    onChange={(e) => setEditMaterialUrl(e.target.value)}
                    placeholder="https://example.com/slide"
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden bg-neutral-50/20"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Description (Optional)</label>
                <textarea 
                  value={editMaterialDesc}
                  onChange={(e) => setEditMaterialDesc(e.target.value)}
                  placeholder="Resource description"
                  rows={4}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs focus:outline-hidden resize-none bg-neutral-50/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button 
                  type="button" 
                  onClick={() => setEditingMaterial(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updateMaterialMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
                >
                  {updateMaterialMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
