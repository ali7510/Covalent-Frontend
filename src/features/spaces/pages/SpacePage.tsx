import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { isAxiosError } from "axios"
import { Users, FileText, Plus, X, Trophy, Bookmark, Settings } from "lucide-react"
import { useSpace, useUserSpaces, useJoinSpace, useLeaveSpace } from "@/hooks/useSpaces"
import { useCurrentSpace } from "@/hooks/useCurrentSpace"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Zod schemas
const createPostSchema = z.object({
  title: z.string().min(1, "Post title is required."),
  body: z.string().min(1, "Content body is required."),
})

type CreatePostFormValues = z.infer<typeof createPostSchema>

const shareResourceSchema = z.object({
  resourceType: z.enum(["FILE", "LINK"]),
  title: z.string().min(1, "Resource title is required"),
  url: z.string().optional(),
  file: z.any().optional(),
  description: z.string().optional(),
}).refine((data) => {
  if (data.resourceType === "LINK") {
    return !!data.url && data.url.trim().length > 0
  }
  return true;
}, {
  message: "Please provide a link URL",
  path: ["url"],
}).refine((data) => {
  if (data.resourceType === "FILE") {
    return !!data.file
  }
  return true;
}, {
  message: "Please select a file to upload",
  path: ["file"],
})

type ShareResourceFormValues = z.infer<typeof shareResourceSchema>

const editMaterialSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  url: z.string().optional(),
  description: z.string().optional(),
})

type EditMaterialFormValues = z.infer<typeof editMaterialSchema>

export default function SpacePage() {
  const { spaceId } = useParams()
  const { user } = useAuth()
  const { isAdmin } = useCurrentSpace()
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

  // RHF for Create Post Form
  const {
    register: registerPost,
    handleSubmit: handleSubmitPost,
    reset: resetPost,
    formState: { errors: errorsPost },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  })

  // RHF for Share Resource Form
  const {
    register: registerResource,
    handleSubmit: handleSubmitResource,
    watch: watchResource,
    setValue: setValueResource,
    reset: resetResource,
    formState: { errors: errorsResource },
  } = useForm<ShareResourceFormValues>({
    resolver: zodResolver(shareResourceSchema),
    defaultValues: {
      resourceType: "FILE",
      title: "",
      url: "",
      file: undefined,
      description: "",
    },
  })

  const watchResourceType = watchResource("resourceType")

  // RHF for Edit Resource Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<EditMaterialFormValues>({
    resolver: zodResolver(editMaterialSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
    },
  })

  // Populate Edit Form when editingMaterial changes
  useEffect(() => {
    if (editingMaterial) {
      resetEdit({
        title: editingMaterial.title,
        url: editingMaterial.url || "",
        description: editingMaterial.description || "",
      })
    }
  }, [editingMaterial, resetEdit])

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

  const handleCreatePost = (values: CreatePostFormValues) => {
    createPostMutation.mutate(
      { title: values.title, body: values.body },
      {
        onSuccess: () => {
          toast.success("Discussion post created!")
          resetPost()
          setIsPostModalOpen(false)
        },
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to submit post" : "Failed to submit post"),
      }
    )
  }

  const handleShareResource = (values: ShareResourceFormValues) => {
    if (values.resourceType === "LINK") {
      shareLinkMutation.mutate(
        { title: values.title, url: values.url!, description: values.description || undefined },
        {
          onSuccess: () => {
            toast.success("Reference link shared!")
            resetResource()
            setIsResourceModalOpen(false)
          },
          onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to share link" : "Failed to share link"),
        }
      )
    } else {
      uploadFileMutation.mutate(
        { title: values.title, file: values.file!, description: values.description || undefined },
        {
          onSuccess: () => {
            toast.success("Lecture worksheet uploaded!")
            resetResource()
            setIsResourceModalOpen(false)
          },
          onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to upload file" : "Failed to upload file"),
        }
      )
    }
  }

  const handleCancelResource = () => {
    resetResource()
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

  const handleEditMaterialSubmit = (values: EditMaterialFormValues) => {
    if (!editingMaterial) return

    updateMaterialMutation.mutate(
      {
        materialId: editingMaterial.id,
        body: {
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          url: editingMaterial.resourceType === "LINK" ? values.url?.trim() : undefined,
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

  const handleDeleteMaterial = (materialId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    deleteMaterialMutation.mutate(materialId, {
      onSuccess: () => {
        toast.success("Resource deleted successfully")
      },
      onError: () => toast.error("Failed to delete resource"),
    })
  }

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
      <Link 
        to="/discover" 
        className="inline-flex items-center text-[12px] font-[510] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>← Back to Discover</span>
      </Link>

      <div className="relative overflow-hidden rounded-md border border-border bg-card p-8 shadow-card-light dark:shadow-card-dark">
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full filter blur-3xl opacity-40 pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3.5 max-w-xl">
            {space.courseCode && (
              <span className="inline-flex items-center rounded-full bg-secondary border border-border px-3 py-1 text-[12px] font-[510] text-foreground">
                Module {space.courseCode}
              </span>
            )}
            <div className="flex items-center space-x-3">
              <h1 className="text-[28px] font-[510] tracking-tight text-foreground leading-none">
                {space.name}
              </h1>
              {isAdmin && (
                <Link
                  to={`/spaces/${spaceId}/settings`}
                  title="Space Settings"
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              )}
            </div>
            <p className="text-muted-foreground font-normal leading-relaxed text-[13px]">
              {space.description || "No description available."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3.5 shrink-0 self-start">
            <button
              onClick={handleJoinToggle}
              disabled={isTransitionPending}
              className={`px-4 py-2 rounded-full text-[12px] font-[510] border active:scale-98 transition-all text-center ${
                isJoined
                  ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                  : "bg-card border-border text-foreground hover:bg-secondary"
              }`}
            >
              {isJoined ? "Leave Space" : "Join Space"}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border text-[11px] font-[510] text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{space.memberCount} Members</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-secondary border border-border text-[11px] font-[510] text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{materials?.totalElements ?? 0} Resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              {(["posts", "materials", "leaderboard"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-[510] capitalize transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "posts" ? "Discussions" : tab === "materials" ? "Resources" : "Leaderboard"}
                </button>
              ))}
            </div>

            {isJoined && activeTab !== "leaderboard" && (
              <button
                onClick={() => {
                  if (activeTab === "posts") setIsPostModalOpen(true)
                  else setIsResourceModalOpen(true)
                }}
                className="inline-flex items-center space-x-1 rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-[12px] font-[510] hover:opacity-90 active:scale-98 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{activeTab === "posts" ? "New Post" : "Share Resource"}</span>
              </button>
            )}
          </div>

          {activeTab === "posts" && (
            <div className="space-y-4">
              {postsLoading ? (
                <LoadingState message="Loading discussions…" />
              ) : posts.length === 0 ? (
                <EmptyState title="No discussions yet" description="Be the first to ask a question in this space." />
              ) : (
                <>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.postId} post={post} />
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[12px] font-[510]">
                    <button
                      onClick={() => setPostsPage((p) => Math.max(0, p - 1))}
                      disabled={postsPage === 0}
                      className="px-3.5 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-secondary transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-muted-foreground font-normal">Page {postsPage + 1}</span>
                    <button
                      onClick={() => setPostsPage((p) => p + 1)}
                      disabled={posts.length < postsPageSize}
                      className="px-3.5 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-secondary transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-1.5 border-b border-border pb-2.5">
                {(["all", "files", "links", "bookmarked"] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setMaterialSubTab(sub)
                      setMaterialsPage(0)
                    }}
                    className={`px-3 py-1 rounded-md text-[10px] font-[510] uppercase tracking-wide border transition-all ${
                      materialSubTab === sub
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sub === "all" ? "All resources" : sub === "files" ? "Files" : sub === "links" ? "Reference URLs" : "Bookmarked"}
                  </button>
                ))}
              </div>

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
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                          {isJoined && (
                            <button 
                              onClick={() => handleToggleBookmark(file.id, file.isBookmarked ?? false)}
                              className="absolute top-4 right-24 p-1 text-muted-foreground hover:text-foreground"
                            >
                              <Bookmark className={`h-4.5 w-4.5 ${file.isBookmarked ? "fill-foreground text-foreground" : ""}`} />
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
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                          {isJoined && (
                            <button 
                              onClick={() => handleToggleBookmark(link.id, link.isBookmarked ?? false)}
                              className="absolute top-4 right-14 p-1 text-muted-foreground hover:text-foreground"
                            >
                              <Bookmark className={`h-4.5 w-4.5 ${link.isBookmarked ? "fill-foreground text-foreground" : ""}`} />
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
                          }}
                          onDelete={handleDeleteMaterial}
                        />
                        {isJoined && (
                          <button 
                            onClick={() => handleToggleBookmark(file.id, file.isBookmarked ?? false)}
                            className="absolute top-4 right-24 p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Bookmark className={`h-4.5 w-4.5 ${file.isBookmarked ? "fill-foreground text-foreground" : ""}`} />
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
                          }}
                          onDelete={handleDeleteMaterial}
                        />
                        {isJoined && (
                          <button 
                            onClick={() => handleToggleBookmark(link.id, link.isBookmarked ?? false)}
                            className="absolute top-4 right-14 p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Bookmark className={`h-4.5 w-4.5 ${link.isBookmarked ? "fill-foreground text-foreground" : ""}`} />
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
                            }}
                            onDelete={handleDeleteMaterial}
                          />
                        )}
                        <button 
                          onClick={() => handleToggleBookmark(bm.id, true)}
                          className="absolute top-4 right-24 p-1 text-foreground hover:text-muted-foreground"
                        >
                          <Bookmark className="h-4.5 w-4.5 fill-foreground text-foreground" />
                        </button>
                      </div>
                    ))
                  )}

                  {materialSubTab !== "bookmarked" && materials && materials.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-4 text-[12px] font-[510]">
                      <button
                        onClick={() => setMaterialsPage((p) => Math.max(0, p - 1))}
                        disabled={materialsPage === 0}
                        className="px-3.5 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-secondary transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-muted-foreground font-normal">
                        Page {materialsPage + 1} of {materials.totalPages}
                      </span>
                      <button
                        onClick={() => setMaterialsPage((p) => p + 1)}
                        disabled={materialsPage + 1 >= materials.totalPages}
                        className="px-3.5 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-secondary transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-md border border-border bg-card overflow-hidden shadow-card-light dark:shadow-card-dark">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="text-[12px] font-[510] uppercase tracking-wider text-foreground flex items-center space-x-2">
                    <Trophy className="h-4 w-4" />
                    <span>Space Contributors</span>
                  </h3>
                </div>

                {lbLoading ? (
                  <LoadingState message="Loading rankings…" />
                ) : !leaderboard || leaderboard.length === 0 ? (
                  <EmptyState title="No active contributors" description="Submit answers and post resources to claim first place!" />
                ) : (
                  <div className="divide-y divide-border text-[12px]">
                    {leaderboard.map((member, index) => {
                      const rank = member.rank ?? (index + 1)
                      const isMe = member.userId === user?.id
                      let rankBorderClass = ""
                      let rankNumberColorClass = "text-muted-foreground font-normal"

                      if (rank === 1) {
                        rankBorderClass = "border-l-4 border-yellow-400"
                        rankNumberColorClass = "text-yellow-400 font-[510]"
                      } else if (rank === 2) {
                        rankBorderClass = "border-l-4 border-slate-400"
                        rankNumberColorClass = "text-slate-400 font-[510]"
                      } else if (rank === 3) {
                        rankBorderClass = "border-l-4 border-orange-400"
                        rankNumberColorClass = "text-orange-400 font-[510]"
                      }

                      return (
                        <div 
                          key={member.userId} 
                          className={`flex items-center justify-between p-4 hover:bg-secondary/30 ${rankBorderClass} ${
                            isMe ? "bg-primary/10 font-[510]" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <span className={`w-6 text-center ${rankNumberColorClass}`}>{rank}</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary border border-border text-[12px] font-[510] text-foreground">
                              {member.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-[510] text-foreground">
                                {member.fullName} {isMe && <span className="text-[10px] text-primary font-medium">(You)</span>}
                              </p>
                              <span className="text-[10px] text-muted-foreground uppercase font-normal">Level {member.level} Scholar</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-[510] text-foreground">{member.xpPoints} XP</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-md bg-secondary text-secondary-foreground p-5 space-y-3">
                <h4 className="text-[16px] font-[510] text-foreground">How to Earn XP</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Post a question in a space</span>
                    <span className="text-primary font-medium">+10 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Answer a question</span>
                    <span className="text-primary font-medium">+15 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Get your answer accepted</span>
                    <span className="text-primary font-medium">+20 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Have your answer upvoted</span>
                    <span className="text-primary font-medium">+5 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Get a "Good Question" vote</span>
                    <span className="text-primary font-medium">+3 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Share a material</span>
                    <span className="text-primary font-medium">+10 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Have your material bookmarked</span>
                    <span className="text-primary font-medium">+3 XP</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Log in daily</span>
                    <span className="text-primary font-medium">+2 XP</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
            <h3 className="text-[14px] font-[510] text-foreground">Space Information</h3>
            <div className="space-y-3 text-[12px] border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-[510] text-foreground capitalize">{space.category || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course Code</span>
                <span className="font-[510] text-foreground uppercase">{space.courseCode || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created By</span>
                <span className="font-[510] text-foreground">{space.createdByName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-[510] text-foreground">{space.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Compose Discussion Post</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost(handleCreatePost)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Post Title</label>
                <input 
                  type="text" 
                  {...registerPost("title")}
                  placeholder="e.g. Question on Lecture 3 slide 14"
                  className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none bg-background text-foreground"
                />
                {errorsPost.title && (
                  <p className="text-[10px] text-red-500 font-medium">{errorsPost.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Content Body</label>
                <textarea 
                  {...registerPost("body")}
                  placeholder="Elaborate your doubt or detail references here..."
                  rows={5}
                  className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none resize-none bg-background text-foreground"
                />
                {errorsPost.body && (
                  <p className="text-[10px] text-red-500 font-medium">{errorsPost.body.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createPostMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {createPostMutation.isPending ? "Posting..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Share Resource</h3>
              <button onClick={handleCancelResource} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResource(handleShareResource)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Resource Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["FILE", "LINK"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => {
                        setValueResource("resourceType", type)
                        if (type === "LINK") {
                          setValueResource("file", undefined)
                        } else {
                          setValueResource("url", "")
                        }
                      }}
                      className={`py-2 text-[12px] font-[510] rounded-md border transition-all ${
                        watchResourceType === type
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type === "FILE" ? "Upload File" : "Share URL Link"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Resource Title</label>
                <input 
                  type="text" 
                  {...registerResource("title")}
                  placeholder={watchResourceType === "FILE" ? "e.g. Calculus midterm solutionsheet" : "e.g. Recommended video references"}
                  className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none bg-background text-foreground"
                />
                {errorsResource.title && (
                  <p className="text-[10px] text-red-500 font-medium">{errorsResource.title.message}</p>
                )}
              </div>

              {watchResourceType === "LINK" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Reference URL Link</label>
                  <input 
                    type="url" 
                    {...registerResource("url")}
                    placeholder="https://example.com/slide"
                    className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none bg-background text-foreground"
                  />
                  {errorsResource.url && (
                    <p className="text-[10px] text-red-500 font-medium">{errorsResource.url.message}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Lecture sheet file (PDF, DOCX, TXT, MD)</label>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      setValueResource("file", e.target.files?.[0] || undefined, { shouldValidate: true })
                    }}
                    className="w-full text-[13px] text-muted-foreground border border-border rounded-md p-2 focus:outline-none bg-background"
                  />
                  {errorsResource.file?.message && (
                    <p className="text-[10px] text-red-500 font-medium">{String(errorsResource.file.message)}</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                <textarea 
                  {...registerResource("description")}
                  placeholder="Provide a small brief explaining the material contents..."
                  rows={3}
                  className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none resize-none bg-background text-foreground"
                />
                {errorsResource.description && (
                  <p className="text-[10px] text-red-500 font-medium">{errorsResource.description.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button 
                  type="button" 
                  onClick={handleCancelResource}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadFileMutation.isPending || shareLinkMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {uploadFileMutation.isPending || shareLinkMutation.isPending ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Edit Resource</h3>
              <button onClick={() => setEditingMaterial(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit(handleEditMaterialSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Resource Title</label>
                <input 
                  type="text" 
                  {...registerEdit("title")}
                  placeholder="Resource title"
                  className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none bg-background text-foreground"
                />
                {errorsEdit.title && (
                  <p className="text-[10px] text-red-500 font-medium">{errorsEdit.title.message}</p>
                )}
              </div>

              {editingMaterial.resourceType === "LINK" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Reference URL Link</label>
                  <input 
                    type="url" 
                    {...registerEdit("url")}
                    placeholder="https://example.com/slide"
                    className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none bg-background text-foreground"
                  />
                  {errorsEdit.url && (
                    <p className="text-[10px] text-red-500 font-medium">{errorsEdit.url.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                <textarea 
                  {...registerEdit("description")}
                  placeholder="Resource description"
                  rows={4}
                  className="w-full rounded-md border border-border p-2.5 text-[13px] focus:outline-none resize-none bg-background text-foreground"
                />
                {errorsEdit.description && (
                  <p className="text-[10px] text-red-500 font-medium">{errorsEdit.description.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setEditingMaterial(null)}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updateMaterialMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
