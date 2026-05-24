import api from "./api";
import type {
  PostResponse,
  AllPostsResponse,
  AnswerResponse,
  CreatePostBody,
  UpdatePostBody,
  CreateAnswerBody,
  UpdateAnswerBody,
  SearchPostsParams,
} from "../lib/types";

const BASE = "/api/v1";

// ---------------------------------------------------------------------------
// Get paginated posts for a space (path-based pagination)
// ---------------------------------------------------------------------------
export async function getSpacePosts(
  spaceId: string,
  page = 0,
  size = 20
): Promise<AllPostsResponse[]> {
  const res = await api.get(`${BASE}/posts/all-posts/${spaceId}/${page}/${size}`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Search posts within a space
// ---------------------------------------------------------------------------
export async function searchPosts(
  spaceId: string,
  params: SearchPostsParams
): Promise<AllPostsResponse[]> {
  const res = await api.get(`${BASE}/posts/search/${spaceId}`, {
    params: {
      query: params.query,
      isSolved: params.isSolved,
      sortBy: params.sortBy ?? "createdAt",
      sortDir: params.sortDir ?? "desc",
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get a single post by ID
// ---------------------------------------------------------------------------
export async function getPost(postId: string): Promise<PostResponse> {
  const res = await api.get(`${BASE}/posts/${postId}`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Create a post inside a space
// ---------------------------------------------------------------------------
export async function createPost(
  spaceId: string,
  body: CreatePostBody
): Promise<PostResponse> {
  const res = await api.post(`${BASE}/spaces/${spaceId}/posts`, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Edit an existing post (author only)
// ---------------------------------------------------------------------------
export async function updatePost(
  postId: string,
  body: UpdatePostBody
): Promise<PostResponse> {
  const res = await api.put(`${BASE}/spaces/posts/${postId}`, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Delete a post (author only)
// ---------------------------------------------------------------------------
export async function deletePost(postId: string): Promise<void> {
  await api.delete(`${BASE}/spaces/posts/${postId}`);
}

// ---------------------------------------------------------------------------
// Good-question vote on a post
// ---------------------------------------------------------------------------
export async function markGoodQuestion(postId: string): Promise<void> {
  await api.post(`${BASE}/posts/${postId}/votes/good-question`);
}

export async function removeGoodQuestion(postId: string): Promise<void> {
  await api.delete(`${BASE}/posts/${postId}/votes/good-question`);
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

export async function getAnswers(
  postId: string,
  page = 0,
  size = 20
): Promise<AnswerResponse[]> {
  const res = await api.get(`${BASE}/posts/${postId}/answers/${page}/${size}`);
  return res.data.data;
}

export async function createAnswer(
  postId: string,
  body: CreateAnswerBody
): Promise<AnswerResponse> {
  const res = await api.post(`${BASE}/posts/${postId}/answers`, body);
  return res.data.data;
}

export async function updateAnswer(
  answerId: string,
  body: UpdateAnswerBody
): Promise<AnswerResponse> {
  const res = await api.put(`${BASE}/answers/${answerId}`, body);
  return res.data.data;
}

export async function deleteAnswer(answerId: string): Promise<void> {
  await api.delete(`${BASE}/answers/${answerId}`);
}

// ---------------------------------------------------------------------------
// Accept / unaccept an answer (post author only)
// ---------------------------------------------------------------------------
export async function acceptAnswer(
  postId: string,
  answerId: string
): Promise<void> {
  await api.post(`${BASE}/posts/${postId}/accepted-answer/${answerId}`);
}

export async function unacceptAnswer(postId: string): Promise<void> {
  await api.delete(`${BASE}/posts/${postId}/accepted-answer`);
}

// ---------------------------------------------------------------------------
// Upvote an answer
// ---------------------------------------------------------------------------
export async function upvoteAnswer(answerId: string): Promise<void> {
  await api.post(`${BASE}/answers/${answerId}/votes/upvote`);
}

export async function removeUpvote(answerId: string): Promise<void> {
  await api.delete(`${BASE}/answers/${answerId}/votes/upvote`);
}