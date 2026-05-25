import { useState } from "react"
import { isAxiosError } from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
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

export default function PostPage() {
  const { postId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Compose reply state
  const [answerText, setAnswerText] = useState("")
  const [hasVotedGood, setHasVotedGood] = useState(() => {
    if (!postId) return false
    const voted = localStorage.getItem("votedQuestions")
    if (!voted) return false
    try {
      const ids = JSON.parse(voted) as string[]
      return ids.includes(postId)
    } catch {
      return false
    }
  })

  // Edit Post Dialog State
  const [isEditPostOpen, setIsEditPostOpen] = useState(false)
  const [editPostTitle, setEditPostTitle] = useState("")
  const [editPostBody, setEditPostBody] = useState("")

  // Edit Answer Dialog State
  const [editingAnswer, setEditingAnswer] = useState<{ id: string; body: string } | null>(null)
  const [editAnswerBody, setEditAnswerBody] = useState("")

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

    if (hasVotedGood) {
      removeVoteGoodMutation.mutate(undefined, {
        onSuccess: () => {
          setHasVotedGood(false)
          const voted = localStorage.getItem("votedQuestions")
          try {
            const ids = voted ? (JSON.parse(voted) as string[]) : []
            const filtered = ids.filter((id) => id !== postId)
            localStorage.setItem("votedQuestions", JSON.stringify(filtered))
          } catch {
            // ignore
          }
          toast.success("Vote removed")
        },
        onError: () => toast.error("Failed to remove vote"),
      })
    } else {
      voteGoodMutation.mutate(undefined, {
        onSuccess: () => {
          setHasVotedGood(true)
          const voted = localStorage.getItem("votedQuestions")
          try {
            const ids = voted ? (JSON.parse(voted) as string[]) : []
            if (postId && !ids.includes(postId)) {
              ids.push(postId)
            }
            localStorage.setItem("votedQuestions", JSON.stringify(ids))
          } catch {
            // ignore
          }
          toast.success("Voted question as good!")
        },
        onError: () => toast.error("Failed to vote"),
      })
    }
  }

  const handleComposeAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerText.trim()) {
      toast.error("Reply body cannot be empty")
      return
    }

    createAnswerMutation.mutate(
      { body: answerText },
      {
        onSuccess: () => {
          toast.success("Reply submitted!")
          setAnswerText("")
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
        onSuccess: () => toast.success("Upvote removed"),
        onError: () => toast.error("Failed to remove upvote"),
      })
    } else {
      upvoteAnswerMutation.mutate(answerId, {
        onSuccess: () => toast.success("Answer upvoted!"),
        onError: () => toast.error("Failed to upvote answer"),
      })
    }
  }

  // Edit Post submit
  const handleEditPostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPostTitle.trim() || !editPostBody.trim()) {
      toast.error("Title and body cannot be empty")
      return
    }

    updatePostMutation.mutate(
      {
        postId: post.id,
        body: { title: editPostTitle, body: editPostBody },
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
  const handleEditAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAnswer) return
    if (!editAnswerBody.trim()) {
      toast.error("Answer body cannot be empty")
      return
    }

    updateAnswerMutation.mutate(
      {
        answerId: editingAnswer.id,
        body: { body: editAnswerBody },
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
        className="inline-flex items-center text-xs font-semibold text-neutral-450 dark:text-neutral-500 hover:text-neutral-850"
      >
        <span>← Back to Space Discussions</span>
      </Link>

      {/* Main Post details */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs flex items-start space-x-5">
        {/* Voting Panel */}
        <div className="flex flex-col items-center space-y-1">
          <button 
            onClick={handleVoteGoodToggle}
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              hasVotedGood
                ? "bg-neutral-950 text-white border-neutral-950 dark:bg-white dark:text-neutral-950 dark:border-white"
                : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:text-neutral-800"
            }`}
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            {post.goodQuestionCount + (hasVotedGood ? 1 : 0)}
          </span>
        </div>

        {/* Content Panel */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-snug">{post.title}</h2>
                {post.isSolved && (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 text-emerald-650 border border-emerald-250 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                    <CheckCircle className="h-3 w-3" />
                    <span>Solved</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">
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
                    setEditPostTitle(post.title)
                    setEditPostBody(post.body)
                    setIsEditPostOpen(true)
                  }}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  title="Edit Post"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={deletePostMutation.isPending}
                  className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-505 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete Post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed font-light whitespace-pre-wrap">
            {post.body}
          </p>

          {/* Stats bar */}
          <div className="flex items-center space-x-4 text-[10px] text-neutral-400 dark:text-neutral-550 pt-2 border-t border-neutral-100 dark:border-neutral-900">
            <span>{post.viewCount} views</span>
            <span>{answers?.length || 0} answers</span>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
          <MessageSquare className="h-4.5 w-4.5 text-neutral-400" />
          <span>Answers ({answers?.length || 0})</span>
        </h3>

        {answersLoading ? (
          <LoadingState message="Loading answers…" />
        ) : !answers || answers.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6 text-neutral-400" />}
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
                  setEditAnswerBody(ans.body)
                }}
                onDelete={handleDeleteAnswer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Composer box */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-200">Compose Reply</h3>
        <form onSubmit={handleComposeAnswerSubmit} className="space-y-4">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your explanation or solutions here..."
            rows={4}
            className="w-full text-xs p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden bg-neutral-50/20 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPendingSubmit}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50 active:scale-98 transition-all"
            >
              {isPendingSubmit ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </form>
      </div>

      {/* EDIT POST DIALOG MODAL */}
      {isEditPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Edit Discussion Post</h3>
              <button onClick={() => setIsEditPostOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditPostSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Title</label>
                <input 
                  type="text" 
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden bg-neutral-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Details</label>
                <textarea 
                  value={editPostBody}
                  onChange={(e) => setEditPostBody(e.target.value)}
                  placeholder="Describe your problem or explanation..."
                  rows={6}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden bg-neutral-50/20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-150">
                <button 
                  type="button" 
                  onClick={() => setIsEditPostOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatePostMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Edit Your Answer</h3>
              <button onClick={() => setEditingAnswer(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditAnswerSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Explanation</label>
                <textarea 
                  value={editAnswerBody}
                  onChange={(e) => setEditAnswerBody(e.target.value)}
                  placeholder="Provide your updated solution details..."
                  rows={6}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 focus:outline-hidden bg-neutral-50/20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-150">
                <button 
                  type="button" 
                  onClick={() => setEditingAnswer(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updateAnswerMutation.isPending}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 hover:opacity-90 disabled:opacity-50"
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
