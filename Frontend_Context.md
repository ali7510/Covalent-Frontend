# Frontend Context — GP Platform

## Goal

Build a modern frontend for an existing Spring Boot backend using:

- React
- TypeScript
- Tailwind CSS
- shadcn/ui

The priority is to move fast, stay organized, and follow industry-standard practices without overcomplicating the stack.

---

## Recommended Technologies

### Core
- **React**: component-based UI library.
- **TypeScript**: static typing for safer frontend code.
- **Vite**: fast dev server and build tool for React projects.

### Styling
- **Tailwind CSS**: utility-first styling.
- **shadcn/ui**: accessible, reusable UI components built on top of Radix and Tailwind.

### App Structure / Navigation
- **React Router DOM**: client-side routing and protected routes.

### Data Fetching / Server State
- **TanStack Query**: API data fetching, caching, loading/error states, background refetching.

### Forms / Validation
- **React Hook Form**: performant form state handling.
- **Zod**: schema validation and type-safe form rules.

### API Requests
- **Axios**: HTTP client for backend calls, interceptors, auth headers.

### Required for this backend
- **Lucide React**: icons (maps well to notification types, space categories, material types, gamification badges).
- **date-fns**: timestamps appear across responses (`createdAt`, `updatedAt`, `lastActivityDate`, `joinedAt`).
- **sonner**: toast notifications for vote/bookmark feedback, notification toasts, and form success/error states.

---

## Why This Stack

- **React** handles UI composition cleanly.
- **TypeScript** reduces bugs and improves autocomplete.
- **Tailwind** makes styling fast and consistent.
- **shadcn/ui** gives polished components without locking into a heavy UI framework.
- **TanStack Query** is better than manually managing API loading states with `useEffect`.
- **React Hook Form + Zod** is a strong combo for forms and validation.
- **Axios** makes backend communication straightforward, especially with JWT interceptors.

---

## Setup Steps

### 1) Create the project

```bash
npm create vite@latest GP-frontend
# Choose: React, TypeScript
cd GP-frontend
npm install
```

### 2) Install Tailwind CSS

Follow the Tailwind setup for Vite, then connect it to the app. Expected result: Tailwind classes work in components and global styles are centralized.

### 3) Initialize shadcn/ui

```bash
npx shadcn@latest init -t vite
```

Then add components as needed:

```bash
npx shadcn@latest add button input form table dialog dropdown-menu badge avatar tabs card progress separator tooltip skeleton scroll-area
```

### 4) Install the main libraries

```bash
npm install react-router-dom axios @tanstack/react-query react-hook-form zod
npm install lucide-react date-fns sonner
```

---

## Folder Structure

```text
src/
├── app/
│   ├── router.tsx              ← All route definitions and protected route logic
│   └── providers.tsx           ← QueryClientProvider, Toaster, AuthProvider
├── components/
│   ├── ui/                     ← shadcn auto-generated components (do not edit manually)
│   └── shared/                 ← Reusable custom components
│       ├── Sidebar.tsx
│       ├── SpaceCard.tsx
│       ├── PostCard.tsx
│       ├── AnswerCard.tsx
│       ├── FileCard.tsx
│       ├── LinkCard.tsx
│       ├── OnlineCourseCard.tsx
│       ├── UserAvatar.tsx
│       ├── NotificationBell.tsx
│       └── PageLayout.tsx      ← Wraps pages with Sidebar + content area
├── features/
│   ├── auth/                   ← Login, Register, ForgotPassword, ResetPassword pages
│   ├── users/                  ← Profile page (Info + Gamification tabs), ChangePassword
│   ├── spaces/                 ← Home, SpaceSearch, SpacePage (Posts + Materials + Leaderboard tabs)
│   ├── posts/                  ← PostPage (post detail + answers)
│   ├── materials/              ← Materials tab inside SpacePage
│   ├── notifications/          ← Notifications page, preferences
│   ├── gamification/           ← System Leaderboard page, XP dashboard
│   ├── courses/                ← Course registration (used inside Profile page)
│   └── recommendations/        ← Online Courses page
├── pages/
│   ├── AuthPage.tsx
│   ├── HomePage.tsx
│   ├── SpaceSearchPage.tsx
│   ├── SpacePage.tsx
│   ├── PostPage.tsx
│   ├── OnlineCoursesPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── NotificationsPage.tsx
│   └── AboutPage.tsx
├── services/
│   ├── api.ts                  ← Axios instance with interceptors
│   ├── auth.ts
│   ├── users.ts
│   ├── spaces.ts
│   ├── posts.ts
│   ├── materials.ts
│   ├── notifications.ts
│   ├── gamification.ts
│   └── courses.ts
├── hooks/                      ← Custom TanStack Query hooks per feature
├── lib/
│   ├── types.ts                ← All TypeScript interfaces matching backend DTOs
│   └── enums.ts                ← SpaceCategory, AcceptedFileType, ReferenceType, VoteType, etc.
└── main.tsx
```

---

## Token Management & Auth Flow

The backend issues two tokens on login:

- **Access token (JWT):** ~15 minute expiry. Sent as `Authorization: Bearer <token>`.
- **Refresh token:** 7-day opaque UUID string. Sent to `POST /api/v1/auth/refresh` to obtain a new pair.

### Required Axios setup

```ts
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.token}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

> On logout, send `refreshToken` in the body to `POST /api/v1/users/logout`. For logout from all devices, call `POST /api/v1/auth/logout-all`.

---

## Response Envelope Unwrapping

All backend responses follow `{ success, message, data }`. Unwrap in the service layer, not in components:

```ts
export async function getProfile(): Promise<UserResponse> {
  const res = await api.get('/api/v1/users/profile');
  return res.data.data;
}
```

---

## File Upload Pattern

Materials support `multipart/form-data`. Use `FormData`:

```ts
const formData = new FormData();
formData.append('spaceId', spaceId);
formData.append('title', title);
if (description) formData.append('description', description);
formData.append('file', file);

await api.post('/api/v1/materials/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

## Pagination Patterns

Two pagination patterns exist — keep them consistent:

- **Posts & Answers:** Path params → `/api/v1/posts/all-posts/{spaceId}/{page}/{size}`
- **Materials:** Query params → `/api/v1/materials/space/{spaceId}/paged?page=0&size=20`
- **Notifications:** Query params → `/api/v1/notifications/all-notifications?page=0&size=10`

---

## Space Creation Conflict Flow

`POST /api/v1/spaces` with `force=0` (default) may return **409 Conflict** with a list of similar spaces. Handle it:

1. Detect `409` status.
2. Show similar spaces in a `shadcn Dialog`.
3. Let the user confirm by re-submitting with `?force=1`.

---

## Notification Deep-Linking

Use `referenceType` + `referenceId` from `NotificationResponse` to navigate:

```ts
const buildNotificationLink = (type: string, referenceId: string) => {
  switch (type) {
    case 'NEW_POST':
    case 'GOOD_QUESTION':
    case 'NEW_ANSWER':
    case 'ANSWER_ACCEPTED':
      return `/posts/${referenceId}`;
    case 'NEW_MATERIAL':
      return `/materials/${referenceId}`;
    case 'UPVOTE':
      return `/posts/${referenceId}`;
    default:
      return '/notifications';
  }
};
```

---

## TypeScript Types (`src/lib/types.ts`)

Keep all backend DTO types here. This is the single source of truth for API response shapes. When a new endpoint is added, update this file first.

```ts
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
```

---

## Enums (`src/lib/enums.ts`)

```ts
export enum SpaceCategory {
  COLLEGE_COURSE = 'COLLEGE_COURSE',
  PROGRAMMING_LANGUAGE = 'PROGRAMMING_LANGUAGE',
  FRAMEWORK = 'FRAMEWORK',
  TUTORIAL = 'TUTORIAL',
}

export enum AcceptedFileType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  TXT = 'TXT',
  MD = 'MD',
  LINK = 'LINK',
}

export enum ReferenceType {
  NEW_POST = 'NEW_POST',
  NEW_MATERIAL = 'NEW_MATERIAL',
  UPVOTE = 'UPVOTE',
  GOOD_QUESTION = 'GOOD_QUESTION',
  NEW_ANSWER = 'NEW_ANSWER',
  ANSWER_ACCEPTED = 'ANSWER_ACCEPTED',
}

export enum MemberRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}
```

---

## Pages, Endpoints & Navigation

### Navigation Overview

```text
AuthPage  (public, no sidebar)
  ├── /login
  └── /register
      └── (forgot-password, reset-password: inline or separate routes)

Protected routes (all require valid JWT, all render with Sidebar):
  /home                        ← HomePage
  /spaces/search               ← SpaceSearchPage
  /spaces/:spaceId             ← SpacePage (Posts / Materials / Members Leaderboard tabs)
  /posts/:postId               ← PostPage
  /online-courses              ← OnlineCoursesPage
  /leaderboard                 ← LeaderboardPage
  /profile                     ← ProfilePage (Info / Gamification tabs)
  /notifications               ← NotificationsPage
  /about                       ← AboutPage (static)
```

Clicking a **SpaceCard** navigates to `/spaces/:spaceId`.
Clicking the **Answers** button on a PostCard navigates to `/posts/:postId`.
Clicking a **Notification** navigates using the deep-link helper (`referenceType` + `referenceId`).

---

### 1. Auth Page — `/login` and `/register`

**Description:** Split-screen layout. The form side and the image/logo side swap positions between login and register. Toggle between the two modes via an in-page link.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Register | POST | `/api/v1/auth/register` |
| Login | POST | `/api/v1/auth/login` |
| Forgot Password | POST | `/api/v1/auth/forgot-password` |
| Reset Password | POST | `/api/v1/auth/reset-password` |

**Request / Response shapes:**

- `POST /register` body: `{ fullName, email, password, studentId?, academicYear?, currentSemester? }` → returns `RegisterResponse`
- `POST /login` body: `{ email, password }` → returns `AuthResponse` (store `token` as `accessToken` and `refreshToken` in localStorage)
- `POST /forgot-password` body: `{ email }` → always returns 200 (no enumeration)
- `POST /reset-password` body: `{ token, newPassword }` → 200 on success

**Zod validation notes (align with backend):**
- Password: min 8, max 64, must contain uppercase, lowercase, digit, special character.
- Student ID: exactly 8 digits (optional).
- Academic year: 1–5. Current semester: 1–10.

**Navigation:** On successful login → redirect to `/home`. After registration → redirect to `/login`.

---

### 2. Home Page — `/home`

**Description:** Displays all spaces the user is currently a member of as SpaceCards. If no memberships exist, show a centered "Join a Space" button and "Create Space" button.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get user's spaces | GET | `/api/v1/spaces/all-spaces` |
| Create space | POST | `/api/v1/spaces?force=0` |
| Create space (force) | POST | `/api/v1/spaces?force=1` |

**Notes:**
- `GET /all-spaces` returns `SpaceResponse[]` — the spaces the authenticated user is a member of.
- On `POST /spaces` returning **409 Conflict**, show a dialog listing the `SpaceResponse[]` in the response body (each with `similarityScore`). Let the user re-submit with `force=1`.
- Create space form fields: `name` (max 100), `description` (max 1000), `category` (SpaceCategory enum), `courseCode` (max 30, relevant if category is `COLLEGE_COURSE`).

**Navigation:** Clicking a SpaceCard → `/spaces/:spaceId`.

---

### 3. Space Search Page — `/spaces/search`

**Description:** Search bar at the top, filters for space category and sort order (by creation date or member count). Default view shows recommended/active spaces. Results update after search.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Browse active spaces | GET | `/api/v1/spaces/active-spaces?page=0&size=20` |
| Search spaces | GET | `/api/v1/spaces/search?query=&category=&sortBy=createdAt&sortDir=desc&page=0&size=20` |
| Join a space | POST | `/api/v1/spaces/:spaceId/join` |

**Query params for search:**
- `query`: substring matched against name and description (optional).
- `category`: one of `SpaceCategory` enum values (optional filter).
- `sortBy`: `memberCount` or `createdAt` (default).
- `sortDir`: `asc` or `desc` (default).
- `page` / `size`: pagination.

**Notes:**
- SpaceCards show a **Join** button for spaces the user is not a member of.
- On joining, show a success toast and refresh the user's space list.

**Navigation:** Clicking a SpaceCard where user is already a member → `/spaces/:spaceId`. Clicking Join on a non-member card → call join endpoint, then navigate to `/spaces/:spaceId`.

---

### 4. Space Page — `/spaces/:spaceId`

**Description:** Top navbar with three tabs: **Posts** (default), **Materials**, **Members Leaderboard**.

#### Tab: Posts

Displays all posts in this space as PostCards, ordered oldest to newest by default. Includes a search bar and filters (solved/unsolved, sort by creation date or good question count). A "Create Post" button opens a form.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get all posts | GET | `/api/v1/posts/all-posts/:spaceId/:page/:size` |
| Search posts | GET | `/api/v1/posts/search/:spaceId?query=&isSolved=&sortBy=createdAt&sortDir=desc&page=0&size=20` |
| Create post | POST | `/api/v1/spaces/:spaceId/posts` |
| Edit post | PUT | `/api/v1/spaces/posts/:postId` |
| Delete post | DELETE | `/api/v1/spaces/posts/:postId` |
| Mark good question | POST | `/api/v1/posts/:postId/votes/good-question` |
| Remove good question | DELETE | `/api/v1/posts/:postId/votes/good-question` |

**Create post body:** `{ title (10–300 chars), body (min 30 chars) }` → returns `PostResponse`.

**Search params:**
- `query`: substring matched against title and body.
- `isSolved`: `true` / `false` / omit for all.
- `sortBy`: `goodQuestionCount` or `createdAt`.
- `sortDir`: `asc` or `desc`.

#### Tab: Materials

Three sub-tabs: **Files**, **Links**, **Bookmarked**. "Add Material" button in Files and Links tabs. Search bar and filters (type, sort by bookmark count or creation date).

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get paged materials | GET | `/api/v1/materials/space/:spaceId/paged?page=0&size=20` |
| Get bookmarked | GET | `/api/v1/materials/space/:spaceId/bookmarked?page=0&size=20` |
| Search materials | GET | `/api/v1/materials/space/:spaceId/search?query=&resourceType=&sortBy=createdAt&sortDir=desc` |
| Upload file | POST | `/api/v1/materials/upload` (multipart) |
| Share link | POST | `/api/v1/materials/link?spaceId=:spaceId` |
| Bookmark | POST | `/api/v1/materials/:materialId/bookmark` |
| Remove bookmark | DELETE | `/api/v1/materials/:materialId/bookmark` |
| Download file | GET | `/api/v1/materials/:materialId/download` |
| Edit material | PATCH | `/api/v1/materials/:materialId` |
| Delete material | DELETE | `/api/v1/materials/:materialId` |

**Upload file params:** `spaceId`, `title`, `description` (optional), `file` (multipart). Accepted types: PDF, DOC, DOCX, TXT, MD.

**Share link body:** `{ title (max 255), description (max 1000), url (http/https, max 1024) }`.

**Search params:**
- `query`: substring on title/description.
- `resourceType`: `PDF` | `DOCX` | `DOC` | `TXT` | `MD` | `LINK`.
- `sortBy`: `linkCount` or `createdAt`.
- `sortDir`: `asc` or `desc`.

**Sub-tab logic:**
- **Files tab:** shows materials where `resourceType !== 'LINK'`.
- **Links tab:** shows materials where `resourceType === 'LINK'`.
- **Bookmarked tab:** uses the `/bookmarked` endpoint.

#### Tab: Members Leaderboard

Displays the leaderboard for this space. The current user's rank is shown separately on the side.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get space leaderboard | GET | `/api/v1/gamification/leaderboard/spaces/:spaceId?limit=20` |

**Response:** `SpaceLeaderboardEntry[]` — includes `rank`, `fullName`, `xpPoints`, `level`, `postsInSpace`, `answersInSpace`, `materialsSharedInSpace`.

**Navigation:** Clicking a PostCard's Answers button → `/posts/:postId`. Leave space → call `DELETE /api/v1/spaces/:spaceId/leave`, then redirect to `/home`.

---

### 5. Post Page — `/posts/:postId`

**Description:** Displays the full post at the top (author, avatar, date, title, body, good question button + counter). Below it, all answer cards are listed. An answer input field with submit button sits at the bottom.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get post | GET | `/api/v1/posts/:postId` |
| Get answers (paged) | GET | `/api/v1/posts/:postId/answers/:page/:size` |
| Submit answer | POST | `/api/v1/posts/:postId/answers` |
| Edit answer | PUT | `/api/v1/answers/:answerId` |
| Delete answer | DELETE | `/api/v1/answers/:answerId` |
| Mark good question | POST | `/api/v1/posts/:postId/votes/good-question` |
| Remove good question | DELETE | `/api/v1/posts/:postId/votes/good-question` |
| Accept answer | POST | `/api/v1/posts/:postId/accepted-answer/:answerId` |
| Unaccept answer | DELETE | `/api/v1/posts/:postId/accepted-answer` |
| Upvote answer | POST | `/api/v1/answers/:answerId/votes/upvote` |
| Remove upvote | DELETE | `/api/v1/answers/:answerId/votes/upvote` |

**Notes:**
- **Good Question** button is hidden for the post author (compare `authorId` with current user `id`).
- **Accept Answer** button is visible only to the post author.
- **Upvote** button on an answer is hidden for the answer's own author.
- Answer body: min 10 characters.

**Navigation:** Back button or breadcrumb → `/spaces/:spaceId`.

---

### 6. Online Courses Page — `/online-courses`

**Description:** Tabs to navigate between sources (YouTube, Udemy, Coursera, etc.). Displays recommended course cards per source.

**Notes:** The backend recommendation controller (`/api/v1/recommendations/courses`) is **not yet implemented**. Use placeholder/mock data or a loading state with a "coming soon" message until the ML service is ready.

**Navigation:** Course cards have a "Go To →" button that opens the course URL in a new tab.

---

### 7. Leaderboard Page — `/leaderboard`

**Description:** Displays the platform-wide leaderboard. The current user's rank is shown separately on the side.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get system leaderboard | GET | `/api/v1/gamification/leaderboard?limit=50` |

**Response:** `SystemLeaderboardEntry[]` — includes `rank`, `fullName`, `xpPoints`, `level`, `totalPosts`, `totalAnswers`, `totalMaterialsShared`.

**Notes:** Highlight the current user's row in the table. If the current user is not in the top N, show their rank in a sticky card on the side using `GET /api/v1/gamification/me` to get their XP and derive context.

---

### 8. Profile Page — `/profile`

**Description:** Two tabs: **Info** and **Gamification**.

#### Tab: Info

User info section (avatar, name, email, semester, academic year, etc.) with an Edit Profile button and a Logout button. Below that, a registered courses section (current and previous) with a "Register New Course" button.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get profile | GET | `/api/v1/users/profile` |
| Update profile | PATCH | `/api/v1/users/profile` |
| Change password | POST | `/api/v1/users/change-password` |
| Logout | POST | `/api/v1/users/logout` |
| Logout all | POST | `/api/v1/auth/logout-all` |
| Get current courses | GET | `/api/v1/courses/current` |
| Get all courses | GET | `/api/v1/courses/all` |
| Register course | POST | `/api/v1/courses` |
| Update registration | PATCH | `/api/v1/courses/:id` |
| Delete registration | DELETE | `/api/v1/courses/:id` |

**Update profile body (all optional):** `{ fullName, academicYear (1–5), currentSemester (1–10), department, imageUrl, bio }`.

**Register course body:** `{ courseCode (max 30), courseName (max 200), semester (1–2), academicYear (1–5) }`.

**Update registration body (all optional):** `{ grade (max 5), result (0.0–100.0, 1 decimal), isCurrent }`.

**Notes:** Show current courses (`isCurrent: true`) and previous courses (`isCurrent: false`) in separate sections or a filtered view. After logout, clear localStorage and redirect to `/login`.

**Toggle notification preferences:**

| Action | Method | Path |
|---|---|---|
| Toggle email notifications | PUT | `/api/v1/notifications/toggle-email` |
| Toggle in-app notifications | PUT | `/api/v1/notifications/toggle-inapp` |

#### Tab: Gamification

XP progress bar, current level, login streak, and activity counters dashboard.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get gamification profile | GET | `/api/v1/gamification/me` |

**Response fields to display:** `xpPoints`, `level`, `currentStreakDays`, `longestStreakDays`, `totalPosts`, `totalAnswers`, `totalUpvotesReceived`, `totalMaterialsShared`, `lastActivityDate`.

---

### 9. Notifications Page — `/notifications`

**Description:** Paginated list of all user notifications. Unread notifications are visually distinguished. Clicking a notification marks it as read and navigates to the relevant entity.

**Endpoints:**

| Action | Method | Path |
|---|---|---|
| Get notifications | GET | `/api/v1/notifications/all-notifications?page=0&size=10` |
| Mark as read | PUT | `/api/v1/notifications/mark-read/:notificationId` |

**Navigation on click:** Use the deep-link helper with `referenceType` + `referenceId` (see Notification Deep-Linking section above).

**Notes:** Unread count badge on the Sidebar notification icon should reflect unread notifications. Derive the count from `isRead === false` across the fetched page, or implement a separate badge count if the backend adds that endpoint later.

---

### 10. About Page — `/about`

**Description:** Static content page. No API calls needed.

---

## Shared Components

### Sidebar

Persistent left-side navigation present on all protected pages. Contains links (top to bottom):

1. Home (`/home`)
2. Search (`/spaces/search`)
3. Online Courses (`/online-courses`)
4. Leaderboard (`/leaderboard`)
5. Profile (`/profile`)
6. Notifications (`/notifications`) — with unread badge
7. About Us (`/about`) — at the very bottom

---

### SpaceCard

Props derived from `SpaceResponse`:
- Displays: `name`, `description`, `category`, `memberCount`
- **Join** button (calls `POST /api/v1/spaces/:spaceId/join`) — visible only if user is not a member
- Clicking the card (when member) navigates to `/spaces/:spaceId`; clicking when not a member prompts joining

---

### PostCard

Props derived from `AllPostsResponse`:
- Displays: author name, author avatar, `createdAt` (formatted with date-fns), `title`, `body` preview
- **Good Question** button + counter — hidden for the post author
- **Answers** button — navigates to `/posts/:postId`
- Shows first 3 answers (`top3Answers`) as compact previews
- Answer input field + submit button (calls `POST /api/v1/posts/:postId/answers`)

---

### AnswerCard

Props derived from `AnswerResponse`:
- Displays: author name, author photo, `createdAt` (formatted), `body`
- **Upvote** button + counter — hidden for the answer author; visible to space members only
- **Accept Answer** button — visible only to the post author

---

### FileCard

Props derived from `MaterialResponse` where `resourceType !== 'LINK'`:
- Displays: file type icon (from `resourceType`), `uploadedByName`, `title`, `description`, `createdAt`, type badge, `linkCount` (bookmark count)
- **Download** button — calls `GET /api/v1/materials/:materialId/download`
- **Bookmark** toggle — calls `POST` or `DELETE /api/v1/materials/:materialId/bookmark`
- Clicking the card opens the file in a preview

---

### LinkCard

Props derived from `MaterialResponse` where `resourceType === 'LINK'`:
- Displays: `uploadedByName`, `title`, `description`, `createdAt`, `linkCount` (bookmark count)
- **Bookmark** toggle
- Clicking opens the URL in a new browser tab (`target="_blank"`)

---

### OnlineCourseCard

Props derived from future `CourseResponse` (not yet implemented):
- Displays: source tag with icon (YouTube / Udemy / Coursera), `title`, `description`, `rating`, review count
- **"Go To →"** button opens the course URL in a new tab

---

## Best Practices

- Keep all API logic in `services/`.
- Keep reusable UI in `components/shared/`.
- Keep feature-specific code in `features/`.
- Define all backend DTO types in `lib/types.ts` — update it before building any new feature.
- Use TanStack Query for all server state; avoid `useEffect` for data fetching.
- Use React Hook Form for all forms; use Zod for validation aligned with backend constraints.
- Always unwrap the `ApiResponse<T>` envelope in the service layer.
- Handle `401` centrally in the Axios interceptor.
- Never hardcode UUIDs — always read from API responses.
- Use `sonner` toasts for all user-facing feedback (success, error, loading).
- Use `date-fns` (`formatDistanceToNow`, `format`) for all timestamp rendering.

---

## Final Stack Summary

```text
Vite
React
TypeScript
Tailwind CSS
shadcn/ui
React Router DOM
TanStack Query
Axios
React Hook Form
Zod
Lucide React
date-fns
sonner
```

---

## Theme / Color Palette

> Not decided yet — update this section before starting UI work.