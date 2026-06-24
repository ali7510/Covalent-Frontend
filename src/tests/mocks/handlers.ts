import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8080/api/v1";

// ---------------------------------------------------------------------------
// Reusable fixture data
// ---------------------------------------------------------------------------

export const fixtures = {
  user: {
    id: "user-1",
    email: "ada@test.com",
    fullName: "Ada Lovelace",
    studentId: "20240001",
    academicYear: 2,
    currentSemester: 3,
    gpa: 3.8,
    department: "Computer Science",
    imageUrl: null,
    bio: "I love algorithms",
  },

  auth: {
    token: "access-token-abc",
    tokenType: "Bearer",
    refreshToken: "refresh-token-xyz",
    user: {
      id: "user-1",
      email: "ada@test.com",
      fullName: "Ada Lovelace",
    },
  },

  space: {
    id: "space-1",
    name: "Algorithms & Data Structures",
    slug: "algorithms-data-structures",
    description: "Deep dives into CS fundamentals",
    category: "COLLEGE_COURSE",
    courseCode: "CS301",
    createdById: "user-1",
    createdByName: "Ada Lovelace",
    isActive: true,
    memberCount: 42,
    createdAt: "2024-01-10T10:00:00Z",
  },

  membership: {
    id: "membership-1",
    spaceId: "space-1",
    spaceName: "Algorithms & Data Structures",
    userId: "user-1",
    userName: "Ada Lovelace",
    role: "MEMBER",
    joinedAt: "2024-02-01T09:00:00Z",
  },

  post: {
    id: "post-1",
    spaceId: "space-1",
    authorId: "user-1",
    authorName: "Ada Lovelace",
    title: "How does merge sort achieve O(n log n)?",
    body: "I understand that merge sort splits the array in half recursively, but I am struggling to see why the complexity is O(n log n) and not O(n²).",
    isSolved: false,
    acceptedAnswerId: null,
    viewCount: 15,
    goodQuestionCount: 3,
    answerCount: 2,
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
  },

  allPost: {
    postId: "post-1",
    title: "How does merge sort achieve O(n log n)?",
    body: "I understand that merge sort splits the array in half recursively...",
    authorId: "user-1",
    authorName: "Ada Lovelace",
    authorAvatarUrl: null,
    spaceId: "space-1",
    spaceName: "Algorithms & Data Structures",
    goodQuestionCount: 3,
    answerCount: 2,
    viewCount: 15,
    solved: false,
    top3Answers: [],
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
  },

  answer: {
    id: "answer-1",
    postId: "post-1",
    authorId: "user-2",
    authorName: "Charles Babbage",
    body: "The key insight is that each merge step processes all n elements, and there are log n levels of recursion.",
    upvoteCount: 5,
    isAccepted: false,
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-03-01T09:00:00Z",
  },

  material: {
    id: "material-1",
    spaceId: "space-1",
    spaceName: "Algorithms & Data Structures",
    uploadedById: "user-1",
    uploadedByName: "Ada Lovelace",
    title: "Lecture Slides Week 3",
    description: "Covers merge sort and quicksort",
    resourceType: "PDF",
    url: "https://storage.example.com/slides.pdf",
    fileSizeKb: 512,
    linkCount: 8,
    isBookmarked: false,
    createdAt: "2024-03-02T10:00:00Z",
    updatedAt: "2024-03-02T10:00:00Z",
  },

  notification: {
    id: "notif-1",
    senderId: "user-2",
    senderName: "Charles Babbage",
    notificationType: "NEW_ANSWER",
    title: "New answer on your post",
    message: "Charles Babbage answered your question",
    referenceType: "NEW_ANSWER",
    referenceId: "post-1",
    isRead: false,
    createdAt: "2024-03-01T10:00:00Z",
  },

  gamification: {
    userId: "user-1",
    xpPoints: 1250,
    level: 5,
    totalPosts: 12,
    totalAnswers: 34,
    totalUpvotesReceived: 89,
    totalMaterialsShared: 7,
    currentStreakDays: 4,
    longestStreakDays: 14,
    lastActivityDate: "2024-03-01T10:00:00Z",
  },

  leaderboardEntry: {
    rank: 1,
    userId: "user-1",
    fullName: "Ada Lovelace",
    xpPoints: 1250,
    level: 5,
    totalPosts: 12,
    totalAnswers: 34,
    totalMaterialsShared: 7,
  },

  course: {
    id: "course-1",
    userId: "user-1",
    courseCode: "CS301",
    courseName: "Algorithms & Data Structures",
    semester: 1,
    academicYear: 2,
    grade: "A",
    result: 95.0,
    isCurrent: true,
  },
};

// Convenience wrapper — every success response follows this envelope
function ok<T>(data: T) {
  return HttpResponse.json({ success: true, message: "OK", data });
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const handlers = [
  // ── Auth ─────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/register`, () =>
    ok({ userId: "user-1", email: "ada@test.com", fullName: "Ada Lovelace" })
  ),

  http.post(`${BASE}/auth/login`, () => ok(fixtures.auth)),

  http.post(`${BASE}/auth/refresh`, () =>
    ok({ token: "new-access-token", tokenType: "Bearer", refreshToken: "new-refresh-token", user: fixtures.auth.user })
  ),

  http.post(`${BASE}/auth/forgot-password`, () =>
    ok(null)
  ),

  http.post(`${BASE}/auth/reset-password`, () =>
    ok(null)
  ),

  http.post(`${BASE}/auth/logout-all`, () =>
    ok(null)
  ),

  // ── Users ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/users/profile`, () => ok(fixtures.user)),

  http.patch(`${BASE}/users/profile`, () =>
    ok({ ...fixtures.user, fullName: "Ada K. Lovelace" })
  ),

  http.post(`${BASE}/users/change-password`, () => ok(null)),

  http.post(`${BASE}/users/logout`, () => ok(null)),

  http.put(`${BASE}/notifications/toggle-email`, () => ok(null)),

  http.put(`${BASE}/notifications/toggle-inapp`, () => ok(null)),

  // ── Spaces ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/spaces/all-spaces`, () => ok([fixtures.space])),

  http.get(`${BASE}/spaces/active-spaces`, () => ok([fixtures.space])),

  http.get(`${BASE}/spaces/search`, () => ok([fixtures.space])),

  http.get(`${BASE}/recommendations/spaces`, () => ok([
    {
      space: fixtures.space,
      score: 0.95,
      methodCount: 2,
      reasons: ["COURSE_MATCH", "SOCIAL"]
    }
  ])),

  http.get(`${BASE}/spaces/space-1`, () => ok(fixtures.space)),

  http.post(`${BASE}/spaces`, () => ok(fixtures.space)),

  http.post(`${BASE}/spaces/space-1/join`, () => ok(fixtures.membership)),

  http.delete(`${BASE}/spaces/space-1/leave`, () => ok(null)),

  // ── Posts ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/posts/all-posts/space-1/0/20`, () => ok([fixtures.allPost])),

  http.get(`${BASE}/posts/search/space-1`, () => ok([fixtures.allPost])),

  http.get(`${BASE}/posts/post-1`, () => ok(fixtures.post)),

  http.post(`${BASE}/spaces/space-1/posts`, () => ok(fixtures.post)),

  http.put(`${BASE}/spaces/posts/post-1`, () =>
    ok({ ...fixtures.post, title: "Updated: How does merge sort work?" })
  ),

  http.delete(`${BASE}/spaces/posts/post-1`, () => ok(null)),

  http.post(`${BASE}/posts/post-1/votes/good-question`, () => ok(null)),

  http.delete(`${BASE}/posts/post-1/votes/good-question`, () => ok(null)),

  // ── Answers ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/posts/post-1/answers/0/20`, () => ok([fixtures.answer])),

  http.post(`${BASE}/posts/post-1/answers`, () => ok(fixtures.answer)),

  http.put(`${BASE}/answers/answer-1`, () =>
    ok({ ...fixtures.answer, body: "Updated answer body with more detail." })
  ),

  http.delete(`${BASE}/answers/answer-1`, () => ok(null)),

  http.post(`${BASE}/posts/post-1/accepted-answer/answer-1`, () => ok(null)),

  http.delete(`${BASE}/posts/post-1/accepted-answer`, () => ok(null)),

  http.post(`${BASE}/answers/answer-1/votes/upvote`, () => ok(null)),

  http.delete(`${BASE}/answers/answer-1/votes/upvote`, () => ok(null)),

  // ── Materials ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/materials/space/space-1/paged`, () =>
    ok({ content: [fixtures.material], totalElements: 1, totalPages: 1, number: 0, size: 20 })
  ),

  http.get(`${BASE}/materials/space/space-1/bookmarked`, () =>
    ok({ content: [{ ...fixtures.material, isBookmarked: true }], totalElements: 1, totalPages: 1, number: 0, size: 20 })
  ),

  http.get(`${BASE}/materials/space/space-1/search`, () =>
    ok([fixtures.material])
  ),

  http.post(`${BASE}/materials/upload`, () => ok(fixtures.material)),

  http.post(`${BASE}/materials/link`, () =>
    ok({ ...fixtures.material, resourceType: "LINK", url: "https://example.com" })
  ),

  http.post(`${BASE}/materials/material-1/bookmark`, () => ok(null)),

  http.delete(`${BASE}/materials/material-1/bookmark`, () => ok(null)),

  http.get(`${BASE}/materials/material-1/download`, () => {
// 💡 Returning a simple string entirely avoids the 'stream is not a function' 
    // undici crash. Axios/fetch on the frontend will still wrap this text 
    // in a Blob if configured to do so!
    return new HttpResponse("Mock PDF Content", {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="mock-material.pdf"',
      },
    });
  }),

  http.patch(`${BASE}/materials/material-1`, () =>
    ok({ ...fixtures.material, title: "Updated Slides" })
  ),

  http.delete(`${BASE}/materials/material-1`, () => ok(null)),

  // ── Notifications ─────────────────────────────────────────────────────────
  http.get(`${BASE}/notifications`, () =>
    ok({ content: [fixtures.notification], totalElements: 1, totalPages: 1, number: 0, size: 10 })
  ),

  http.put(`${BASE}/notifications/mark-read/notif-1`, () => ok(null)),

  // ── Gamification ──────────────────────────────────────────────────────────
  http.get(`${BASE}/gamification/me`, () => ok(fixtures.gamification)),

  http.get(`${BASE}/gamification/leaderboard`, () =>
    ok([fixtures.leaderboardEntry])
  ),

  http.get(`${BASE}/gamification/leaderboard/spaces/space-1`, () =>
    ok([{ ...fixtures.leaderboardEntry, postsInSpace: 3, answersInSpace: 8, materialsSharedInSpace: 2 }])
  ),

  // ── Courses ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/courses/current`, () => ok([fixtures.course])),

  http.get(`${BASE}/courses/all`, () =>
    ok([fixtures.course, { ...fixtures.course, id: "course-2", isCurrent: false, grade: "B+", result: 85.5 }])
  ),

  http.post(`${BASE}/courses`, () => ok(fixtures.course)),

  http.patch(`${BASE}/courses/course-1`, () =>
    ok({ ...fixtures.course, grade: "A+", result: 98.0 })
  ),

  http.delete(`${BASE}/courses/course-1`, () => ok(null)),
];