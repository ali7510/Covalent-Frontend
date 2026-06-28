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
    id: 1,
    code: "CS301",
    termWork: 35.0,
    examWork: 55.0,
    result: 90.0,
    grade: "A",
    points: 4.0,
    closed: false,
    createdAt: "2026-06-25T12:00:00Z",
    updatedAt: "2026-06-25T12:00:00Z",
  },

  onlineCourse: {
    id: "online-course-1",
    courseCode: "CS301",
    courseName: "Algorithms & Data Structures",
    source: "Coursera",
    title: "Algorithms, Part I",
    url: "https://www.coursera.org/learn/algorithms-part1",
    description: "This course covers the essential information that every serious programmer needs to know about algorithms and data structures.",
    rating: 4.9,
    reviews: 12450,
    price: 0.0,
    score: 0.98,
    lastUpdated: "2024-03-01T12:00:00Z",
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

  http.get(`${BASE}/recommendations/courses`, () => ok([
    fixtures.onlineCourse,
    {
      id: "online-course-2",
      courseCode: "CS301",
      courseName: "Algorithms & Data Structures",
      source: "Udemy",
      title: "Master the Coding Interview: Data Structures + Algorithms",
      url: "https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/",
      description: "Ace your coding interview. Learn Big O notation, data structures, algorithms, and mockup interviews.",
      rating: 4.7,
      reviews: 84300,
      price: 19.99,
      score: 0.92,
      lastUpdated: "2024-02-15T10:00:00Z"
    },
    {
      id: "online-course-3",
      courseCode: "CS202",
      courseName: "Object Oriented Programming",
      source: "Coursera",
      title: "Object Oriented Java Programming: Data Structures and Beyond",
      url: "https://www.coursera.org/specializations/java-object-oriented",
      description: "Learn to write clean, reusable, object-oriented code in Java with algorithms and advanced data structure techniques.",
      rating: 4.8,
      reviews: 5320,
      price: 0.0,
      score: 0.89,
      lastUpdated: "2024-01-20T08:00:00Z"
    },
    {
      id: "online-course-4",
      courseCode: "CS202",
      courseName: "Object Oriented Programming",
      source: "Udemy",
      title: "Java Programming Masterclass covering Java 11 & Java 17",
      url: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
      description: "Learn OOP, Java programming, clean code, design patterns, and multithreading.",
      rating: 4.6,
      reviews: 320100,
      price: 14.99,
      score: 0.84,
      lastUpdated: "2024-03-10T09:00:00Z"
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

  http.get(`${BASE}/courses`, () =>
    ok([
      fixtures.course,
      {
        ...fixtures.course,
        id: 2,
        code: "CS302",
        termWork: 32.0,
        examWork: 50.0,
        result: 82.0,
        grade: "B+",
        points: 3.3,
        closed: true,
      },
    ])
  ),

  http.post(`${BASE}/courses`, () => ok(fixtures.course)),

  http.patch(`${BASE}/courses/:id`, () =>
    ok({
      ...fixtures.course,
      termWork: 35.0,
      examWork: 55.0,
      result: 90.0,
      grade: "A+",
      points: 4.0,
      closed: true,
    })
  ),

  http.delete(`${BASE}/courses/:id`, () => ok(null)),

  // ── Reference Data ────────────────────────────────────────────────────────
  http.get(`${BASE}/reference-data/courses`, () =>
    ok({
      version: "1.0",
      updated: "2026-06-21",
      courses: [
        { code: "CS301", name: "Algorithms & Data Structures" },
        { code: "CS302", name: "Software Engineering" },
        { code: "AI311", name: "Introduction to Logic" },
      ],
    })
  ),

  http.get(`${BASE}/reference-data/grades`, () =>
    ok({
      version: "1.0",
      updatedAt: "2026-06-21",
      scale: [
        { grade: "A+", min: 90, max: 100, points: 4.0 },
        { grade: "B+", min: 80, max: 89, points: 3.3 },
      ],
    })
  ),

  // ── Questionnaire & Prediction ────────────────────────────────────────────
  http.get(`${BASE}/questionnaire`, () => {
    return HttpResponse.json({
      metadata: {
        title: "Test Questionnaire",
        version: "1.0",
        total_questions: 1,
        departments: ["CS", "AI"],
        instructions: "Test info",
        time_estimate: "1 min",
      },
      questions: [
        {
          id: 1,
          text: "What appeals to you most?",
          type: "scenario_choice",
          answers: [
            { id: "a", text: "Software Systems", scores: { CS: 3, AI: 1 } },
            { id: "b", text: "Intelligent Systems", scores: { CS: 1, AI: 3 } },
          ],
        },
      ],
    });
  }),

  http.post(`${BASE}/questionnaire/score`, () =>
    ok({
      raw: { CS: 3, AI: 1 },
      normalized: { CS: 0.75, AI: 0.25 },
    })
  ),

  http.post(`${BASE}/predictions/department`, () =>
    ok({
      departmentScores: [
        { department: "Computer Science", questionnaireScore: 0.75, modelScore: 0.85, combinedScore: 0.8 },
        { department: "Artificial Intelligence", questionnaireScore: 0.25, modelScore: 0.15, combinedScore: 0.2 },
      ],
      topDepartment: "Computer Science",
      modelAvailable: true,
      modelVersion: "v1.0",
      warning: null,
      weights: { questionnaire: 0.5, model: 0.5 },
    })
  ),
];