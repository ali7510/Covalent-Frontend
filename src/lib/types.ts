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

export interface SpaceResponse {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category?: string;       // SpaceCategory enum
    courseCode?: string;
    createdById: string;
    createdByName: string;
    isActive: boolean;
    memberCount: number;
    createdAt: string;
    similarityScore?: number; // Only in 409 conflict response
}

export interface MembershipResponse {
    id: string;
    spaceId: string;
    spaceName: string;
    userId: string;
    userName: string;
    role: 'MEMBER' | 'ADMIN';
    joinedAt: string;
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
    createdAt: string;
    updatedAt: string;
}

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
    createdAt: string;
    updatedAt: string;
}

export interface MaterialResponse {
    id: string;
    spaceId: string;
    spaceName: string;
    uploadedById: string;
    uploadedByName: string;
    title: string;
    description?: string;
    resourceType: string;    // 'PDF' | 'DOC' | 'DOCX' | 'TXT' | 'MD' | 'LINK'
    url: string;
    fileSizeKb?: number;
    linkCount: number;
    isBookmarked: boolean;
    createdAt: string;
    updatedAt: string;
}

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

// Paged wrapper used by several endpoints
export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;     // current page (0-based)
    size: number;
}