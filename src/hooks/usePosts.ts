import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSpacePosts,
  searchPosts,
  getPost,
  getAnswers,
  createPost,
  updatePost,
  deletePost,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  markGoodQuestion,
  removeGoodQuestion,
  acceptAnswer,
  unacceptAnswer,
  upvoteAnswer,
  removeUpvote,
} from "@/services/posts"
import type {
  AllPostsResponse,
  PostResponse,
  AnswerResponse,
  CreatePostBody,
  UpdatePostBody,
  CreateAnswerBody,
  UpdateAnswerBody,
} from "@/lib/types"

export function useSpacePosts(spaceId: string | undefined, page = 0, size = 20, enabled = true) {
  return useQuery<AllPostsResponse[], Error>({
    queryKey: ["spacePosts", spaceId, page, size],
    queryFn: () => getSpacePosts(spaceId || "", page, size),
    enabled: enabled && !!spaceId,
  })
}

export function usePost(postId: string | undefined) {
  return useQuery<PostResponse, Error>({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId || ""),
    enabled: !!postId,
    refetchOnWindowFocus: false,
  })
}

export function useAnswers(postId: string | undefined) {
  return useQuery<AnswerResponse[], Error>({
    queryKey: ["answers", postId],
    queryFn: () => getAnswers(postId || "", 0, 100), // Fetch up to 100 answers
    enabled: !!postId,
  })
}

export function useCreatePost(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<PostResponse, Error, CreatePostBody>({
    mutationFn: (body) => createPost(spaceId || "", body),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spacePosts", spaceId] })
      }
    },
  })
}

export function useUpdatePost(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<PostResponse, Error, { postId: string; body: UpdatePostBody }>({
    mutationFn: ({ postId, body }) => updatePost(postId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] })
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spacePosts", spaceId] })
      }
    },
  })
}

export function useDeletePost(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spacePosts", spaceId] })
      }
    },
  })
}

export function useCreateAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<AnswerResponse, Error, CreateAnswerBody>({
    mutationFn: (body) => createAnswer(postId || "", body),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useUpdateAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<AnswerResponse, Error, { answerId: string; body: UpdateAnswerBody }>({
    mutationFn: ({ answerId, body }) => updateAnswer(answerId, body),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useDeleteAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (answerId) => deleteAnswer(answerId),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useGoodQuestion(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: () => markGoodQuestion(postId || ""),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useRemoveGoodQuestion(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: () => removeGoodQuestion(postId || ""),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useAcceptAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (answerId) => acceptAnswer(postId || "", answerId),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useUnacceptAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: () => unacceptAnswer(postId || ""),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
        queryClient.invalidateQueries({ queryKey: ["post", postId] })
      }
    },
  })
}

export function useUpvoteAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (answerId) => upvoteAnswer(answerId),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
      }
    },
  })
}

export function useRemoveUpvoteAnswer(postId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (answerId) => removeUpvote(answerId),
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["answers", postId] })
      }
    },
  })
}

export function useSearchSpacePosts(
  spaceId: string | undefined,
  params: {
    query?: string
    isSolved?: boolean
    sortBy?: "goodQuestionCount" | "createdAt"
    sortDir?: "asc" | "desc"
    page?: number
    size?: number
  },
  enabled = true
) {
  return useQuery<AllPostsResponse[], Error>({
    queryKey: ["spacePostsSearch", spaceId, params],
    queryFn: () =>
      searchPosts(spaceId || "", {
        query: params.query,
        isSolved: params.isSolved,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        page: params.page,
        size: params.size,
      }),
    enabled: enabled && !!spaceId,
  })
}
