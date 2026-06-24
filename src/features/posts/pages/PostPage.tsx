import { useState } from "react"
import { isAxiosError } from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { MessageSquare, ArrowUp, User, Clock, CheckCircle, Edit, Trash2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/features/auth/AuthContext"
import {
  usePost,
  useAnswers,
  useCreateAnswer,
  useGoodQuestion,
  useRemoveGoodQuestion,
  useAcceptAnswer,
  useUnacceptAnswer,
  useUpvoteAnswer,
  useRemoveUpvoteAnswer,
  useUpdatePost,
  useDeletePost,
  useUpdateAnswer,
  useDeleteAnswer,
} from "@/hooks/usePosts"
import AnswerCard from "@/components/shared/AnswerCard"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const createAnswerSchema = z.object({
  body: z.string().min(1, "Reply body cannot be empty"),
})

const editPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
})

const editAnswerSchema = z.object({
  body: z.string().min(1, "Answer body cannot be empty"),
})

type CreateAnswerValues = z.infer<typeof createAnswerSchema>
type EditPostValues = z.infer<typeof editPostSchema>
type EditAnswerValues = z.infer<typeof editAnswerSchema>

export default function PostPage() {
  const { postId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Edit Post Dialog Open State
  const [isEditPostOpen, setIsEditPostOpen] = useState(false)

  // Edit Answer State
  const [editingAnswer, setEditingAnswer] = useState<{ id: string; body: string } | null>(null)

  // React Hook Forms
  const composeForm = useForm<CreateAnswerValues>({
    resolver: zodResolver(createAnswerSchema),
    defaultValues: { body: "" },
  })

  const editPostForm = useForm<EditPostValues>({
    resolver: zodResolver(editPostSchema),
    defaultValues: { title: "", body: "" },
  })

  const editAnswerForm = useForm<EditAnswerValues>({
    resolver: zodResolver(editAnswerSchema),
    defaultValues: { body: "" },
  })

  // API State Fetching
  const { data: post, isLoading: postLoading } = usePost(postId)
  const { data: answers, isLoading: answersLoading } = useAnswers(postId)

  // Mutation hooks
  const createAnswerMutation = useCreateAnswer(postId)
  const voteGoodMutation = useGoodQuestion(postId)
  const removeVoteGoodMutation = useRemoveGoodQuestion(postId)
  const acceptAnswerMutation = useAcceptAnswer(postId)
  const unacceptAnswerMutation = useUnacceptAnswer(postId)
  const upvoteAnswerMutation = useUpvoteAnswer(postId)
  const removeUpvoteAnswerMutation = useRemoveUpvoteAnswer(postId)
  
  const updatePostMutation = useUpdatePost(post?.spaceId)
  const deletePostMutation = useDeletePost(post?.spaceId)
  const updateAnswerMutation = useUpdateAnswer(postId)
  const deleteAnswerMutation = useDeleteAnswer(postId)

  if (postLoading) {
    return <LoadingState message="Loading post details…" />
  }

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        description="The post you're looking for doesn't exist or has been removed."
      />
    )
  }

  const isPostAuthor = post.authorId === user?.id
  const isPendingSubmit = createAnswerMutation.isPending

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    } catch {
      return post.createdAt || "N/A"
    }
  })()

  const handleVoteGoodToggle = () => {
    if (isPostAuthor) {
      toast.error("You cannot vote on your own question!")
      return
    }

    const hasVoted = post.hasVoted ?? false

    if (hasVoted) {
      removeVoteGoodMutation.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["post", postId] })
          toast.success("Vote removed")
        },
        onError: () => toast.error("Failed to remove vote"),
      })
    } else {
      voteGoodMutation.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["post", postId] })
          toast.success("Voted question as good!")
        },
        onError: () => toast.error("Failed to vote"),
      })
    }
  }

  const handleComposeAnswerSubmit = (values: CreateAnswerValues) => {
    createAnswerMutation.mutate(
      { body: values.body },
      {
        onSuccess: () => {
          toast.success("Reply submitted!")
          composeForm.reset()
        },
        onError: (err) => toast.error(isAxiosError(err) ? err.response?.data?.message || "Failed to submit answer" : "Failed to submit answer"),
      }
    )
  }

  const handleAcceptAnswer = (answerId: string) => {
    acceptAnswerMutation.mutate(answerId, {
      onSuccess: () => toast.success("Answer verified!"),
      onError: () => toast.error("Failed to verify answer"),
    })
  }

  const handleUnacceptAnswer = () => {
    unacceptAnswerMutation.mutate(undefined, {
      onSuccess: () => toast.success("Verification removed"),
      onError: () => toast.error("Failed to unverify answer"),
    })
  }

  const handleUpvoteToggle = (answerId: string, hasUpvoted: boolean) => {
    if (hasUpvoted) {
      removeUpvoteAnswerMutation.mutate(answerId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["answers", postId] })
          toast.success("Upvote removed")
        },
        onError: () => toast.error("Failed to remove upvote"),
      })
    } else {
      upvoteAnswerMutation.mutate(answerId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["answers", postId] })
          toast.success("Answer upvoted!")
        },
        onError: () => toast.error("Failed to upvote answer"),
      })
    }
  }


  // Edit Post submit
  const handleEditPostSubmit = (values: EditPostValues) => {
    updatePostMutation.mutate(
      {
        postId: post.id,
        body: { title: values.title.trim(), body: values.body.trim() },
      },
      {
        onSuccess: () => {
          toast.success("Post updated successfully!")
          setIsEditPostOpen(false)
        },
        onError: () => toast.error("Failed to update post"),
      }
    )
  }

  // Delete Post
  const handleDeletePost = () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    deletePostMutation.mutate(post.id, {
      onSuccess: () => {
        toast.success("Post deleted successfully")
        navigate(`/spaces/${post.spaceId}`)
      },
      onError: () => toast.error("Failed to delete post"),
    })
  }

  // Edit Answer submit
  const handleEditAnswerSubmit = (values: EditAnswerValues) => {
    if (!editingAnswer) return

    updateAnswerMutation.mutate(
      {
        answerId: editingAnswer.id,
        body: { body: values.body.trim() },
      },
      {
        onSuccess: () => {
          toast.success("Answer updated successfully!")
          setEditingAnswer(null)
        },
        onError: () => toast.error("Failed to update answer"),
      }
    )
  }

  // Delete Answer
  const handleDeleteAnswer = (answerId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) return

    deleteAnswerMutation.mutate(answerId, {
      onSuccess: () => {
        toast.success("Answer deleted successfully")
      },
      onError: () => toast.error("Failed to delete answer"),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in duration-300">
      {/* Back to space link */}
      <Link 
        to={`/spaces/${post.spaceId}`} 
        className="inline-flex items-center text-[12px] font-[510] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>← Back to Space Discussions</span>
      </Link>

      {/* Main Post details */}
      <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark flex items-start space-x-5">
        {/* Voting Panel */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={handleVoteGoodToggle}
            className={`p-1.5 rounded-md border transition-all duration-200 ${
              post.hasVoted
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <span className="text-[12px] font-[510] text-foreground">
            {post.goodQuestionCount}
          </span>
        </div>

        {/* Content Panel */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h2 className="text-[17px] font-[510] text-foreground leading-snug">{post.title}</h2>
                {post.isSolved && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[9px] font-[510] uppercase tracking-wider dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle className="h-3 w-3" />
                    <span>Solved</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-muted-foreground font-medium">
                <span className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Posted by {post.authorName || "N/A"}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo}</span>
                </span>
              </div>
            </div>

            {/* Edit / Delete actions for Post Author */}
            {isPostAuthor && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    editPostForm.reset({
                      title: post.title,
                      body: post.body,
                    })
                    setIsEditPostOpen(true)
                  }}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Edit Post"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={deletePostMutation.isPending}
                  className="p-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete Post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-[13px] text-muted-foreground leading-relaxed font-normal whitespace-pre-wrap">
            {post.body}
          </p>

          {/* Stats bar */}
          <div className="flex items-center space-x-4 text-[10px] text-muted-foreground pt-2 border-t border-border">
            <span>{post.viewCount} views</span>
            <span>{answers?.length || 0} answers</span>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <h3 className="text-[14px] font-[510] text-foreground flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>Answers ({answers?.length || 0})</span>
        </h3>

        {answersLoading ? (
          <LoadingState message="Loading answers…" />
        ) : !answers || answers.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6 text-muted-foreground" />}
            title="No answers yet"
            description="Be the first to answer this question."
          />
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <AnswerCard 
                key={answer.id} 
                answer={answer} 
                isPostAuthor={isPostAuthor}
                isAnswerAuthor={answer.authorId === user?.id}
                onAccept={handleAcceptAnswer}
                onUnaccept={handleUnacceptAnswer}
                onUpvoteToggle={handleUpvoteToggle}
                onEdit={(ans) => {
                  setEditingAnswer({ id: ans.id, body: ans.body })
                  editAnswerForm.reset({ body: ans.body })
                }}
                onDelete={handleDeleteAnswer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Composer box */}
      <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
        <h3 className="text-[11px] font-[510] uppercase tracking-wider text-foreground">Compose Reply</h3>
        {isPostAuthor ? (
          <div className="flex items-start space-x-3 p-3.5 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <span className="text-amber-600 dark:text-amber-400 text-[11px] font-[510] mt-0.5">⚠</span>
            <p className="text-[12px] text-amber-700 dark:text-amber-300 font-normal leading-relaxed">
              You cannot answer your own question. Others can reply to your post.
            </p>
          </div>
        ) : (
          <form onSubmit={composeForm.handleSubmit(handleComposeAnswerSubmit)} className="space-y-4">
            <textarea
              {...composeForm.register("body")}
              placeholder="Type your explanation or solutions here..."
              rows={4}
              className="w-full text-[13px] p-3 border border-border rounded-md focus:outline-none bg-background text-foreground resize-none"
            />
            {composeForm.formState.errors.body && (
              <p className="text-[10px] text-red-500 font-medium">{composeForm.formState.errors.body.message}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPendingSubmit}
                className="px-4 py-2 rounded-full text-[13px] font-[510] bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 active:scale-98 transition-all"
              >
                {isPendingSubmit ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* EDIT POST DIALOG MODAL */}
      {isEditPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Edit Discussion Post</h3>
              <button onClick={() => setIsEditPostOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editPostForm.handleSubmit(handleEditPostSubmit)} className="space-y-4 text-[12px]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Title</label>
                <input 
                  type="text" 
                  {...editPostForm.register("title")}
                  placeholder="Ask a question..."
                  className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground"
                />
                {editPostForm.formState.errors.title && (
                  <p className="text-[10px] text-red-500 font-medium">{editPostForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Details</label>
                <textarea 
                  {...editPostForm.register("body")}
                  placeholder="Describe your problem or explanation..."
                  rows={6}
                  className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground resize-none"
                />
                {editPostForm.formState.errors.body && (
                  <p className="text-[10px] text-red-500 font-medium">{editPostForm.formState.errors.body.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsEditPostOpen(false)}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatePostMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANSWER DIALOG MODAL */}
      {editingAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-[14px] font-[510] text-foreground">Edit Your Answer</h3>
              <button onClick={() => setEditingAnswer(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editAnswerForm.handleSubmit(handleEditAnswerSubmit)} className="space-y-4 text-[12px]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[510] uppercase tracking-wider text-muted-foreground">Explanation</label>
                <textarea 
                  {...editAnswerForm.register("body")}
                  placeholder="Provide your updated solution details..."
                  rows={6}
                  className="w-full rounded-md border border-border p-2.5 focus:outline-none bg-background text-foreground resize-none"
                />
                {editAnswerForm.formState.errors.body && (
                  <p className="text-[10px] text-red-500 font-medium">{editAnswerForm.formState.errors.body.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setEditingAnswer(null)}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updateAnswerMutation.isPending}
                  className="px-3.5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {updateAnswerMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
