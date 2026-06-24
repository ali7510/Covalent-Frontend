// ---------------------------------------------------------------------------
// Generic API envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based current page
  size: number;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  studentId?: string;
  academicYear?: number;
  currentSemester?: number;
  gpa?: number;
  department?: string;
  imageUrl?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  refreshToken: string;
  user: UserResponse;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  fullName: string;
}

// ---------------------------------------------------------------------------
// Spaces
// ---------------------------------------------------------------------------

export interface SpaceResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string; // SpaceCategory enum value
  courseCode?: string;
  createdById: string;
  createdByName: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  similarityScore?: number; // only in 409 conflict body
  role?: "MEMBER" | "ADMIN"; // present when fetched as authenticated member
}

export interface MembershipResponse {
  id: string;
  spaceId: string;
  spaceName: string;
  userId: string;
  userName: string;
  role: "MEMBER" | "ADMIN";
  joinedAt: string;
}

// ---------------------------------------------------------------------------
// Posts & Answers
// ---------------------------------------------------------------------------

export interface AnswerSummary {
  answerId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  body: string;
  upvoteCount: number;
  isAccepted: boolean;
  createdAt: string;
}

export interface AllPostsResponse {
  postId: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  spaceId: string;
  spaceName: string;
  goodQuestionCount: number;
  answerCount: number;
  viewCount: number;
  solved: boolean;
  top3Answers: AnswerSummary[];
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostResponse {
  id: string;
  spaceId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  isSolved: boolean;
  acceptedAnswerId?: string;
  viewCount: number;
  goodQuestionCount: number;
  answerCount: number;
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerResponse {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvoteCount: number;
  isAccepted: boolean;
  hasUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export interface MaterialResponse {
  id: string;
  spaceId: string;
  spaceName: string;
  uploadedById: string;
  uploadedByName: string;
  title: string;
  description?: string;
  resourceType: string; // 'PDF' | 'DOC' | 'DOCX' | 'TXT' | 'MD' | 'LINK'
  url: string;
  fileSizeKb?: number;
  linkCount: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface NotificationResponse {
  id: string;
  senderId?: string;
  senderName?: string;
  notificationType: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

export interface GamificationProfileResponse {
  userId: string;
  xpPoints: number;
  level: number;
  totalPosts: number;
  totalAnswers: number;
  totalUpvotesReceived: number;
  totalMaterialsShared: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate?: string;
}

export interface SystemLeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  xpPoints: number;
  level: number;
  totalPosts: number;
  totalAnswers: number;
  totalMaterialsShared: number;
}

export interface SpaceLeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  xpPoints: number;
  level: number;
  postsInSpace: number;
  answersInSpace: number;
  materialsSharedInSpace: number;
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export interface CourseRegistrationResponse {
  id: string;
  userId: string;
  courseCode: string;
  courseName: string;
  semester: number;
  academicYear: number;
  grade?: string;
  result?: number;
  isCurrent: boolean;
}

// ---------------------------------------------------------------------------
// Request body shapes
// ---------------------------------------------------------------------------

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  studentId?: string;
  academicYear?: number;
  currentSemester?: number;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

export interface CreateSpaceBody {
  name: string;
  description?: string;
  category?: string;
  courseCode?: string;
}

export interface CreatePostBody {
  title: string;
  body: string;
}

export interface UpdatePostBody {
  title?: string;
  body?: string;
}

export interface CreateAnswerBody {
  body: string;
}

export interface UpdateAnswerBody {
  body: string;
}

export interface ShareLinkBody {
  title: string;
  description?: string;
  url: string;
}

export interface UpdateMaterialBody {
  title?: string;
  description?: string;
  url?: string;
}

export interface UpdateProfileBody {
  fullName?: string;
  academicYear?: number;
  currentSemester?: number;
  department?: string;
  imageUrl?: string;
  bio?: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterCourseBody {
  courseCode: string;
  courseName: string;
  semester: number;
  academicYear: number;
}

export interface UpdateCourseBody {
  grade?: string;
  result?: number;
  isCurrent?: boolean;
}

export interface SearchSpacesParams {
  query?: string;
  category?: string;
  sortBy?: "memberCount" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface SearchPostsParams {
  query?: string;
  isSolved?: boolean;
  sortBy?: "goodQuestionCount" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface SearchMaterialsParams {
  query?: string;
  resourceType?: string;
  sortBy?: "linkCount" | "createdAt";
  sortDir?: "asc" | "desc";
}

export interface UpdateSpaceBody {
  name?: string;
  description?: string;
  category?: string;
  courseCode?: string;
}

export interface SpaceRecommendationResponse {
  space: SpaceResponse;
  score: number;
  methodCount: number;
  reasons: string[];
}