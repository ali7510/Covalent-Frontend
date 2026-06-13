# COVALENT GP — FRONTEND CONTEXT FILE
**Version:** 2.0 | **Backend Stack:** Spring Boot 4.0.3 / Java 21 / SQL Server | **Frontend Target:** React + TypeScript + Vite

> This file is the single source of truth for building the Covalent GP frontend. Read it fully before writing a single line of code. Each section bundles the backend endpoints, TypeScript types, page spec, component spec, and business logic for a feature in one place. Global rules come first — they apply everywhere.

---

## TABLE OF CONTENTS

1. [General Notes & Critical Rules](#1-general-notes--critical-rules)
2. [Project Overview](#2-project-overview)
3. [Tech Stack](#3-tech-stack)
4. [Setup Steps](#4-setup-steps)
5. [Project Folder Structure](#5-project-folder-structure)
6. [Global API Layer](#6-global-api-layer)
7. [API Response Envelope](#7-api-response-envelope)
8. [Pagination Patterns](#8-pagination-patterns)
9. [Feature Modules](#9-feature-modules)
   - [9.1 Auth](#91-auth)
   - [9.2 User Profile & Password](#92-user-profile--password)
   - [9.3 Spaces](#93-spaces)
   - [9.4 Posts & Answers](#94-posts--answers)
   - [9.5 Materials](#95-materials)
   - [9.6 Notifications](#96-notifications)
   - [9.7 Gamification](#97-gamification)
   - [9.8 Course Registrations](#98-course-registrations)
   - [9.9 Recommendations](#99-recommendations)
10. [Shared UI Component Specs](#10-shared-ui-component-specs)
11. [Route Map](#11-route-map)
12. [TypeScript Types (Single Source of Truth)](#12-typescript-types-single-source-of-truth)
13. [Enums](#13-enums)
14. [Gamification Reference](#14-gamification-reference)
15. [Error Handling Patterns](#15-error-handling-patterns)
16. [Best Practices](#16-best-practices)
17. [AI Prompt Styles](#17-ai-prompt-styles)

---

## 1. General Notes & Critical Rules

These rules apply to every part of the frontend without exception.

**API base URL:** `http://localhost:8080` in development. Reads from `VITE_API_URL` environment variable. All paths below are relative to this base.

**All responses are wrapped** in an `ApiResponse<T>` envelope: `{ success, message, data, timestamp }`. Always unwrap `data` in the service layer, not in components. See Section 7.

**Two pagination patterns exist** and they are different — do not mix them up. See Section 8.

**JWT access token:** short-lived (~15 minutes). Attach as `Authorization: Bearer <token>` on every protected request. The Axios interceptor handles this automatically.

**Refresh token:** 7-day opaque UUID string. Store in `localStorage` as `refreshToken`. Use to silently re-authenticate when the access token expires (401 response). See Section 6 for the full interceptor code.

**Public endpoints** (no JWT required):
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- Swagger UI / OpenAPI docs

**All other endpoints require** `Authorization: Bearer <accessToken>` header.

**Token rotation:** On every successful call to `/auth/refresh`, both the access token and the refresh token are replaced. Store both new values. Reusing a revoked refresh token causes family-wide revocation (all sessions logged out).

**Logout:** single-device logout is `POST /api/v1/users/logout` (send `{ refreshToken }` in body). All-device logout is `POST /api/v1/auth/logout-all`.

**Space membership gating:** Many endpoints require the authenticated user to be a member of the relevant space. Fetching a space detail (`GET /api/v1/spaces/{spaceId}`) returns `403` if the user is not a member. Use `GET /api/v1/spaces/all-spaces` to determine which spaces the current user belongs to.

**Admin gating:** Some space operations (edit space, promote member) require `ADMIN` role within that space. The `MembershipResponse` returned from the join endpoint includes the `role` field (`MEMBER` or `ADMIN`). Cache this locally so the UI can hide/show admin controls.

**File uploads** use `multipart/form-data`. Accepted types: `PDF`, `DOC`, `DOCX`, `TXT`, `MD`. Max file size: 10 MB. The `resourceType` field on `MaterialResponse` will be one of those enum strings or `"LINK"`.

**Never hardcode UUIDs or IDs.** Always read them from API responses.

**Never put token refresh or auth logic inside components.** It all lives in `services/api.ts`.

**Always unwrap** the `ApiResponse.data` envelope inside service functions, not in components or hooks.

**Validate forms with Zod.** Align Zod constraints with the backend's Bean Validation annotations documented in each feature section.

**Color palette:** Not finalized. Use shadcn/ui default theming until a palette is decided. Keep CSS variables for easy future theming.

**Known backend issue (notification routes):** The notification controller has a bug where the base path may be duplicated in some route mappings. Always verify all notification endpoint paths against the running Swagger UI at `http://localhost:8080/swagger-ui/index.html` before building those features.

**Recommendations note:** Only the space recommendation endpoint is fully implemented. The courses and department recommendation endpoints are scaffolded/planned and not yet functional. Do not build UI for those until they are confirmed working.

---

## 2. Project Overview

Covalent GP is a community-driven academic platform for university students. Users register and authenticate, join or create study spaces (organized by course or topic), ask and answer questions, share learning materials (files and links), bookmark useful resources, vote on content, collect XP and streak rewards, and receive in-app notifications for activity in their spaces.

**Core user flows in order of importance:**
1. Register → Login → Home page (your spaces)
2. Discover spaces → Join a space → View posts, materials, leaderboard
3. Create posts → Get answers → Mark solved → Vote
4. Upload files / share links → Bookmark
5. View gamification profile → Leaderboard
6. Manage course registrations
7. Manage notifications

---

## 3. Tech Stack

```
Vite                — build tool and dev server
React               — UI library
TypeScript          — static typing
Tailwind CSS        — utility-first styling
shadcn/ui           — accessible component library (Radix + Tailwind)
React Router DOM    — client-side routing and protected routes
TanStack Query      — server state, caching, loading/error states
Axios               — HTTP client with JWT interceptors
React Hook Form     — form state management
Zod                 — schema validation (align constraints with backend)
Lucide React        — icons
date-fns            — timestamp formatting
sonner              — toast notifications
```

---

## 4. Setup Steps

### Step 1 — Scaffold the project

```bash
npm create vite@latest GP-frontend -- --template react-ts
cd GP-frontend
npm install
```

### Step 2 — Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

In `tailwind.config.js`, add content paths:
```js
content: ["./index.html", "./src/**/*.{ts,tsx}"]
```

In `src/index.css`, add Tailwind directives at the top:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 3 — Initialize shadcn/ui

```bash
npx shadcn@latest init -t vite
```

Then add components as needed (install all at once to avoid interruptions):
```bash
npx shadcn@latest add button input form table dialog dropdown-menu badge avatar tabs card progress separator tooltip textarea select
```

### Step 4 — Install main libraries

```bash
npm install react-router-dom axios @tanstack/react-query react-hook-form zod
npm install lucide-react date-fns sonner
npm install -D @types/node
```

### Step 5 — Set up environment variable

Create `.env.local` at project root:
```
VITE_API_URL=http://localhost:8080
```

### Step 6 — Wrap the app (in `src/main.tsx`)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </QueryClientProvider>
);
```

---

## 5. Project Folder Structure

```
src/
├── app/
│   ├── router.tsx          ← All routes + protected route wrapper
│   └── providers.tsx       ← QueryClient, BrowserRouter, Toaster
├── components/
│   ├── ui/                 ← shadcn generated components (do not edit)
│   └── shared/             ← reusable custom components
│       ├── SideBar.tsx
│       ├── SpaceCard.tsx
│       ├── PostCard.tsx
│       ├── AnswerCard.tsx
│       ├── MaterialFileCard.tsx
│       ├── MaterialLinkCard.tsx
│       ├── NotificationBell.tsx
│       ├── UserAvatar.tsx
│       └── ProtectedRoute.tsx
├── features/
│   ├── auth/               ← login, register, forgot-password, reset-password pages
│   ├── users/              ← profile page, edit profile, change password
│   ├── spaces/             ← home (my spaces), discover, create space, space detail page
│   ├── posts/              ← post feed, post detail, create post form
│   ├── answers/            ← answer form, answer vote, accept answer
│   ├── materials/          ← file list, link list, bookmarked, upload/share forms
│   ├── notifications/      ← notification list page, mark read, preferences
│   ├── gamification/       ← XP profile tab, system leaderboard page, space leaderboard tab
│   └── courses/            ← course registration list, register/edit/delete
├── services/
│   ├── api.ts              ← Axios instance (interceptors live here)
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── spaces.service.ts
│   ├── posts.service.ts
│   ├── materials.service.ts
│   ├── notifications.service.ts
│   ├── gamification.service.ts
│   └── courses.service.ts
├── hooks/
│   ├── useAuth.ts          ← read current user from localStorage / context
│   └── useCurrentSpace.ts  ← track active space + membership role
├── lib/
│   ├── types.ts            ← ALL TypeScript interfaces matching backend DTOs
│   └── enums.ts            ← SpaceCategory, ResourceType, ReferenceType, etc.
└── main.tsx
```

> **Rule:** API logic lives only in `services/`. Reusable UI lives only in `components/shared/`. Feature-specific pages and forms live in `features/`. TypeScript interfaces that match backend DTOs live only in `lib/types.ts`.

---

## 6. Global API Layer

All API communication goes through a single Axios instance in `src/services/api.ts`. Do not create additional Axios instances elsewhere.

```ts
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401, then retry original request
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
        // Store both new tokens — rotation issues a new pair
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.token}`;
        return api(original);
      } catch {
        // Refresh failed — clear storage and force login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 7. API Response Envelope

Every backend endpoint returns:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "timestamp": "2026-01-01T12:00:00Z"
}
```

**Unwrap `data` in service functions, not in components or hooks:**

```ts
// CORRECT — unwrap in the service
export async function getProfile(): Promise<UserResponse> {
  const res = await api.get('/api/v1/users/profile');
  return res.data.data;
}

// WRONG — never unwrap in a component or hook
const res = await api.get('/api/v1/users/profile');
setUser(res.data.data); // ← this belongs in a service function
```

**Paged responses** have this shape inside `data`:
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 134,
  "totalPages": 7,
  "last": false
}
```

Match this with `PagedResponse<T>` in `lib/types.ts`.

---

## 8. Pagination Patterns

The backend uses **two different pagination styles**. Do not mix them.

**Pattern A — Path parameters (Posts and Answers):**
```
GET /api/v1/posts/all-posts/{spaceId}/{page}/{size}
```
`page` is zero-based. `size` defaults to 10.

**Pattern B — Query parameters (Notifications, Materials, Spaces):**
```
GET /api/v1/notifications/all-notifications?page=0&size=10
GET /api/v1/materials/space/{spaceId}/paged?page=0&size=20
GET /api/v1/spaces/active-spaces?page=0&size=20
```
`page` is zero-based. Default `size` is 20. Max `size` is 100.

When building a paginated list component, always check which pattern the endpoint uses and build the URL accordingly.

---

## 9. Feature Modules

---

### 9.1 Auth

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| POST | `/api/v1/auth/register` | No | Register a new account |
| POST | `/api/v1/auth/login` | No | Authenticate, receive tokens |
| POST | `/api/v1/auth/refresh` | No | Rotate refresh token, receive new pair |
| POST | `/api/v1/auth/forgot-password` | No | Send password reset email |
| POST | `/api/v1/auth/reset-password` | No | Redeem token and set new password |
| POST | `/api/v1/auth/logout-all` | Yes | Revoke all refresh tokens for current user |

#### Request / Response Shapes

**POST `/api/v1/auth/register`**
```ts
// Request body
{
  email: string;         // valid email
  password: string;      // 8–64 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char
  fullName: string;      // required
  studentId: string;     // required, must be unique
}

// Response data — verify from Swagger whether this returns tokens (AuthResponse)
// or just user info (RegisterResponse). Navigate accordingly.
// If tokens are returned → store and navigate to home.
// If only user info → navigate to /login.
```

**POST `/api/v1/auth/login`**
```ts
// Request body
{
  email: string;
  password: string;
}

// Response data: AuthResponse
{
  token: string;           // access token (JWT), ~15 min expiry
  tokenType: "Bearer";
  refreshToken: string;    // opaque UUID, 7-day expiry
  user: UserResponse;
}
```

**POST `/api/v1/auth/refresh`**
```ts
// Request body
{
  refreshToken: string;
}

// Response data: AuthResponse (same shape as login)
// IMPORTANT: store BOTH new token and new refreshToken — both change on every refresh.
```

**POST `/api/v1/auth/forgot-password`**
```ts
// Request body
{ email: string; }
// Response data: null (200 OK, email sent in background)
```

**POST `/api/v1/auth/reset-password`**
```ts
// Request body
{
  token: string;       // raw token from the email link (query param from email URL)
  newPassword: string; // 8–64 chars, same rules as registration password
}
// Response data: null (200 OK, all refresh tokens revoked after reset)
```

**POST `/api/v1/auth/logout-all`** (protected)
```ts
// Request body: none
// Response data: null
// Clears all devices. After calling this, clear localStorage and redirect to /login.
```

#### Business Logic

- After login: store `accessToken` and `refreshToken` in `localStorage`. Store the `user` object in a global auth context or Zustand store.
- After login, `GamificationService.trackDailyLogin()` is automatically called by the backend — the frontend does not need to call anything extra for streak tracking.
- Token rotation: after every `/auth/refresh`, replace both tokens in storage. The old refresh token is immediately invalid.
- Reusing a revoked refresh token triggers family-wide revocation (all sessions end). The interceptor handles this by clearing storage and redirecting to `/login`.

#### Page: Login + Register (`/login`, `/register`)

Layout: split-screen — form on one side, decorative image/branding on the other. Swap sides between login and register pages.

**Login page** (`/login`) fields:
- Email input
- Password input (with show/hide toggle)
- "Forgot password?" link → `/forgot-password`
- Submit button with loading state
- Link to `/register`

**Register page** (`/register`) fields:
- Full Name input
- Student ID input
- Email input
- Password input with complexity indicator
- Submit button with loading state
- Link to `/login`

**Post-register flow:** After successful registration, navigate to `/login` (or `/` if backend returns tokens — check Swagger).

**Route guard:** On app load, check `localStorage` for `accessToken`. If present → redirect to `/`. If absent → render login page normally.

#### Page: Forgot Password (`/forgot-password`)

- Email input + submit button
- On success, show a success message: "If that email is registered, a reset link has been sent."
- Do not reveal whether the email exists in the system.

#### Page: Reset Password (`/reset-password?token=<raw-token>`)

- Read `token` from URL query params
- New Password input + Confirm Password input
- Zod validation: passwords must match, must meet complexity rules
- On success, navigate to `/login` with a success toast

---

### 9.2 User Profile & Password

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| GET | `/api/v1/users/profile` | Yes | Get current user's profile |
| PATCH | `/api/v1/users/profile` | Yes | Partial update of profile fields |
| POST | `/api/v1/users/change-password` | Yes | Change password (requires current password) |
| POST | `/api/v1/users/logout` | Yes | Single-device logout (revoke one refresh token) |

#### Request / Response Shapes

**GET `/api/v1/users/profile`**
```ts
// Response data: UserResponse
{
  id: string;            // UUID
  email: string;
  fullName: string;
  studentId: string;
  isActive: boolean;
  // Additional fields may be present — verify from Swagger
}
```

> Note: `/profile` returns the principal loaded at JWT-filter time. It may be slightly stale after a `PATCH /profile`. After a successful profile update, invalidate the TanStack Query cache for this key.

**PATCH `/api/v1/users/profile`** (partial update — null fields are ignored)
```ts
// Request body (all fields optional, send only changed ones)
{
  fullName?: string;
  // Other updatable fields — verify from Swagger
}
// Response data: UserResponse (updated)
```

**POST `/api/v1/users/change-password`**
```ts
// Request body
{
  currentPassword: string;  // must match current password
  newPassword: string;      // 8–64 chars, uppercase + lowercase + digit + special char
}
// Response data: null
// After success: all refresh tokens are revoked. Clear localStorage and redirect to /login.
```

**POST `/api/v1/users/logout`** (single-device logout)
```ts
// Request body
{ refreshToken: string; }  // the current device's refresh token from localStorage
// Response data: null
// After success: clear localStorage and redirect to /login.
```

#### Page: Profile (`/profile`)

Two tabs: **Info** and **Gamification**.

**Info tab:**
- User info section: avatar/initials, full name, email, student ID, active status
- "Edit Profile" button → opens a dialog/drawer with editable fields
- "Logout" button → calls `POST /api/v1/users/logout`, clears storage, redirects to `/login`
- "Change Password" button → opens a dialog with the change-password form
- Course registrations section (see Section 9.8 for full detail)
  - "Register New Course" button at the top of this section
  - Tabs or sections for current/active and past/archived registrations

**Gamification tab:**
- XP progress bar (current XP toward next level)
- Current level badge
- Login streak (current streak days + longest streak days)
- Activity counters: posts created, answers given, materials shared, upvotes received
- See Section 9.7 for data shape

---

### 9.3 Spaces

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| POST | `/api/v1/spaces?force=0` | Yes | Create a space (with duplicate check) |
| POST | `/api/v1/spaces?force=1` | Yes | Create a space (bypass duplicate check) |
| GET | `/api/v1/spaces/{spaceId}` | Yes (member only) | Get space detail |
| GET | `/api/v1/spaces/all-spaces` | Yes | List all spaces the current user is a member of |
| GET | `/api/v1/spaces/active-spaces?page=0&size=20` | Yes | List all active spaces (paginated) |
| GET | `/api/v1/spaces/search?query=&category=&sortBy=createdAt&sortDir=desc&page=0&size=20` | Yes | Search active spaces |
| POST | `/api/v1/spaces/{spaceId}/join` | Yes | Join a space |
| DELETE | `/api/v1/spaces/{spaceId}/leave` | Yes | Leave a space |
| PATCH | `/api/v1/spaces/{spaceId}` | Yes (admin only) | Update space fields |
| POST | `/api/v1/spaces/{spaceId}/admins/{memberId}` | Yes (admin only) | Promote a member to admin |

#### Request / Response Shapes

**POST `/api/v1/spaces`**
```ts
// Request body
{
  name: string;         // required, must be unique
  description: string;  // required
  category: SpaceCategory; // enum — see Section 13
  courseCode?: string;  // required if category = COLLEGE_COURSE
}

// Response data on success (201): SpaceResponse
// Response on conflict (409): ApiResponse where data = SpaceResponse[] (list of similar spaces)
// The 'success' field will be false in the 409 case.
```

**GET `/api/v1/spaces/search`** query params:
- `query` (optional) — substring match against name and description
- `category` (optional) — filter by `SpaceCategory` enum value
- `sortBy` (optional) — `"memberCount"` or `"createdAt"` (default)
- `sortDir` (optional) — `"asc"` or `"desc"` (default)
- `page` (default 0) — zero-based page index
- `size` (default 20, max 100) — items per page

```ts
// Response data: SpaceResponse[]
```

**POST `/api/v1/spaces/{spaceId}/join`**
```ts
// No request body
// Response data (201): MembershipResponse
{
  id: string;        // membership UUID
  spaceId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN';
  joinedAt: string;  // ISO datetime
}
```

**SpaceResponse shape:**
```ts
{
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;       // SpaceCategory enum value as string
  courseCode: string | null;
  createdById: string;
  createdByName: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;      // ISO datetime
}
```

#### Business Logic: Space Creation Conflict Flow

This is a critical UX flow. When `force=0` and similar spaces already exist, the backend returns `409 Conflict` with the list of conflicts in `data`. The frontend must handle this:

1. Submit form with `force=0` (default).
2. If response is `200/201` → space created, navigate to the new space.
3. If response is `409` → **do not show an error toast**. Instead:
   - Keep the page visible
   - Show a message: "Similar spaces already exist. Review them before creating."
   - Display a preview card of the space the user wants to create
   - Render the list of similar spaces returned in `response.data.data`
   - Show a "Create Anyway" button that re-submits the same form with `force=1`
4. If `force=1` returns `201` → navigate to the newly created space.

```ts
// In your mutation handler:
try {
  const res = await createSpace(formData, 0);
  navigate(`/spaces/${res.id}`);
} catch (err) {
  if (axios.isAxiosError(err) && err.response?.status === 409) {
    setSimilarSpaces(err.response.data.data); // list of SpaceResponse
    setShowConflict(true);
  } else {
    toast.error('Failed to create space');
  }
}
```

#### Business Logic: Membership & Admin Checks

- `GET /api/v1/spaces/all-spaces` returns only spaces the current user is a member of. Use this for the Home page.
- `GET /api/v1/spaces/{spaceId}` returns `403` if the user is not a member. Catch this and redirect to the Discover page or show a "Join to view" prompt.
- The sole admin of a space cannot leave until at least one other member is promoted to admin via `POST /api/v1/spaces/{spaceId}/admins/{memberId}`.

#### Page: Home (`/`)

- Fetch the current user's spaces via `GET /api/v1/spaces/all-spaces`.
- If the list is empty: show a centered prompt with two buttons — "Join a Space" (→ `/discover`) and "Create a Space" (→ `/spaces/create`).
- If non-empty: render a grid of `SpaceCard` components. Clicking a card navigates to `/spaces/{spaceId}`.

#### Page: Discover (`/discover`)

- Search bar (debounced, triggers `/spaces/search`)
- Filter controls: space category dropdown, sort by (member count or creation date), sort direction
- Default state (before any search): render recommended spaces from `GET /api/v1/recommendations/spaces`
- After search: render search results
- Each result rendered as a `SpaceCard` with a "Join" button

#### Page: Create Space (`/spaces/create`)

- Page title: "Create New Space" centered at top
- Form with: Name, Description, Category select, Course Code (visible only when category is COLLEGE_COURSE)
- Submit button
- The "Force" button is hidden initially, shown only after a 409 conflict response
- After conflict: show the conflict state UI described above
- After successful creation: navigate to `/spaces/{newSpaceId}`

#### Page: Space Detail (`/spaces/:spaceId`)

Top navbar with three tabs: **Posts** (default), **Materials**, **Members Leaderboard**.

**Posts tab:**
- Display all posts via `GET /api/v1/posts/all-posts/{spaceId}/{page}/{size}` (path pagination)
- Ordered newest first (as returned by API)
- "Create Post" button → opens a modal/dialog with the create post form (see Section 9.4)
- Search bar and filters: filter by solved/unsolved, sort by creation date or "good question" count
- Each post rendered as a `PostCard`; clicking it navigates to `/posts/{postId}`

**Materials tab:**
- Three sub-tabs: **Files**, **Links**, **Bookmarked**
- Files tab: materials where `resourceType !== 'LINK'`
- Links tab: materials where `resourceType === 'LINK'`
- Bookmarked tab: from `GET /api/v1/materials/space/{spaceId}/bookmarked`
- "Add Material" button in Files and Links tabs → opens a modal with toggle between file upload form and link share form
- Search bar + filters: filter by type, sort by bookmark count or creation date

**Members Leaderboard tab:**
- Fetch from `GET /api/v1/gamification/leaderboard/spaces/{spaceId}?limit=20`
- Display ranked list of members
- Current user's rank shown separately on the side (find the current user in the returned list)
- Hints box: list of how to earn XP (see Section 14)

---

### 9.4 Posts & Answers

> **Important:** The post and answer endpoints are split across two controller base paths: `/api/v1/spaces/{spaceId}/posts` (creation) and `/api/v1/posts` (everything else). Verify the exact vote and acceptance endpoint paths from Swagger UI.

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| POST | `/api/v1/spaces/{spaceId}/posts` | Yes (member) | Create a post in a space |
| GET | `/api/v1/posts/{postId}` | Yes (member) | Get a single post (increments view count) |
| GET | `/api/v1/posts/all-posts/{spaceId}/{page}/{size}` | Yes (member) | List posts in a space (path pagination) |
| GET | `/api/v1/posts/search?spaceId={id}&query=&isSolved=&sortBy=&sortDir=&page=&size=` | Yes (member) | Search posts in a space |
| PATCH | `/api/v1/posts/{postId}` | Yes (author only) | Edit post title and body |
| DELETE | `/api/v1/posts/{postId}` | Yes (author only) | Delete a post (cascades to answers and votes) |
| POST | `/api/v1/posts/{postId}/answers` | Yes (member) | Create an answer to a post |
| GET | `/api/v1/posts/{postId}/answers/{page}/{size}` | Yes (member) | List answers for a post (path pagination) |
| PATCH | `/api/v1/posts/{postId}/answers/{answerId}` | Yes (author only) | Edit an answer |
| DELETE | `/api/v1/posts/{postId}/answers/{answerId}` | Yes (author only) | Delete an answer |
| POST | `/api/v1/posts/{postId}/answers/{answerId}/accept` | Yes (post author) | Mark an answer as accepted (solves the post) |
| DELETE | `/api/v1/posts/{postId}/answers/{answerId}/accept` | Yes (post author) | Unmark an accepted answer |
| POST | `/api/v1/posts/{postId}/votes` | Yes (member, not author) | Vote on a post (Good Question) |
| DELETE | `/api/v1/posts/{postId}/votes` | Yes (member, not author) | Remove vote on a post |
| POST | `/api/v1/posts/{postId}/answers/{answerId}/upvote` | Yes (member, not answer author) | Upvote an answer |
| DELETE | `/api/v1/posts/{postId}/answers/{answerId}/upvote` | Yes (member, not answer author) | Remove upvote from answer |

> Verify the exact paths for vote and acceptance endpoints from `http://localhost:8080/swagger-ui/index.html`.

#### Request / Response Shapes

**POST `/api/v1/spaces/{spaceId}/posts`** — Request body:
```ts
{
  title: string;  // 10–300 chars (Zod: z.string().min(10).max(300))
  body: string;   // minimum 30 chars (Zod: z.string().min(30))
  // tags?: string[]; — verify if tags field is accepted (max 5 tags)
}
```

**PostResponse shape:**
```ts
{
  id: string;
  spaceId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  isSolved: boolean;
  acceptedAnswerId: string | null;
  viewCount: number;
  goodQuestionCount: number;
  answerCount: number;
  hasVoted: boolean;       // whether current user voted (verify field name from Swagger)
  createdAt: string;       // ISO datetime
  updatedAt?: string;
}
```

**AllPostsResponse shape** (verify structure from Swagger):
```ts
{
  posts: PostResponse[];
  // may follow PagedResponse pattern — check Swagger
  totalPages?: number;
  totalElements?: number;
}
```

**POST `/api/v1/posts/{postId}/answers`** — Request body:
```ts
{
  body: string;  // minimum 10 chars (Zod: z.string().min(10))
}
```

**AnswerResponse shape:**
```ts
{
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvoteCount: number;
  isAccepted: boolean;
  hasUpvoted: boolean;   // whether current user has upvoted (verify field name from Swagger)
  createdAt: string;
  updatedAt?: string;
}
```

**GET `/api/v1/posts/search`** query params:
- `spaceId` — required UUID
- `query` (optional) — substring in title or body
- `isSolved` (optional) — `true` or `false`
- `sortBy` (optional) — `"goodQuestionCount"` or `"createdAt"` (default)
- `sortDir` (optional) — `"asc"` or `"desc"`
- `page` (default 0)
- `size` (default 20)

#### Business Logic

**Voting rules:**
- A user cannot vote on their own post or their own answer.
- A user must be a member of the space.
- Duplicate votes are blocked by the backend (unique constraint) — show a toast if a 409 is returned.
- Voting on a post = "Good Question" vote (increments `goodQuestionCount`, awards XP to post author).
- Upvoting an answer = increments `upvoteCount`, awards XP to answer author.
- Removing a vote reverses the counter and the XP award.

**Post solved state:**
- Only the post author can mark/unmark a post as solved.
- Marking solved requires specifying which answer is accepted.
- `acceptedAnswerId` on the `PostResponse` is the ID of the accepted `Answer`.
- Once solved, `isSolved = true` on the post and `isAccepted = true` on the specific answer.

**Deleting a post:** cascades to all answers and votes for that post.

**View counter:** incremented automatically on `GET /api/v1/posts/{postId}`. No frontend action needed.

#### Page: Post Detail (`/posts/:postId`)

- Post data displayed at the top: author avatar, author name, creation date, title, body
- "Good Question" button + counter — disabled if user is the author; shows as toggled if `hasVoted = true`
- Answers listed below in paginated form, sorted by upvotes then creation date
- Top 3 most-upvoted answers shown first
- Each answer rendered as `AnswerCard`
- Answer input field + submit button at the bottom (visible only if user is a space member)
- If post is solved: show a "Solved" badge. The accepted answer gets a special visual indicator.

---

### 9.5 Materials

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| POST | `/api/v1/materials/upload` | Yes (member) | Upload a file material (multipart/form-data) |
| POST | `/api/v1/materials/link?spaceId={uuid}` | Yes (member) | Share an external link |
| GET | `/api/v1/materials/{materialId}` | Yes (member) | Get a single material |
| GET | `/api/v1/materials/{materialId}/download` | Yes (member) | Download a file (not available for LINK type) |
| GET | `/api/v1/materials/space/{spaceId}/materials?page=0&size=20` | Yes (member) | List all materials in a space (paginated) |
| GET | `/api/v1/materials/space/{spaceId}/paged?page=0&size=20` | Yes (member) | Alternative paginated materials (returns PagedResponse) |
| GET | `/api/v1/materials/space/{spaceId}/bookmarked?page=0&size=20` | Yes (member) | List materials bookmarked by current user |
| GET | `/api/v1/materials/space/{spaceId}/search?query=&resourceType=&sortBy=createdAt&sortDir=desc&page=0&size=20` | Yes (member) | Search materials in a space |
| POST | `/api/v1/materials/{materialId}/bookmark` | Yes (member) | Bookmark a material |
| DELETE | `/api/v1/materials/{materialId}/bookmark` | Yes (member) | Remove a bookmark |
| PATCH | `/api/v1/materials/{materialId}` | Yes (uploader only) | Edit title/description |
| DELETE | `/api/v1/materials/{materialId}` | Yes (uploader only) | Delete a material |

> There are **two** paginated list endpoints. Use `/paged` (which returns a `PagedResponse<MaterialResponse>`) for consistent pagination UI. The `/materials` endpoint also supports pagination but returns a Spring `Page` wrapper — prefer `/paged`.

#### Request / Response Shapes

**POST `/api/v1/materials/upload`** — `multipart/form-data`:
```ts
// Form fields (NOT JSON body — use FormData)
const formData = new FormData();
formData.append('spaceId', spaceId);
formData.append('title', title);
formData.append('description', description); // optional
formData.append('file', file);              // File object

await api.post('/api/v1/materials/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

Accepted file types: `PDF`, `DOC`, `DOCX`, `TXT`, `MD`. Max size: 10 MB. The backend rejects other types with `400`.

**POST `/api/v1/materials/link?spaceId={uuid}`** — JSON body:
```ts
// spaceId goes in the QUERY PARAM, not the body
// Request body: ShareLinkRequest
{
  title: string;        // required, max 255 chars
  description?: string; // optional, max 1000 chars
  url: string;          // required, must start with http:// or https://, max 1024 chars
}
```

**MaterialResponse shape:**
```ts
{
  id: string;
  spaceId: string;
  spaceName: string;
  uploadedById: string;
  uploadedByName: string;
  title: string;
  description: string | null;
  resourceType: 'PDF' | 'DOC' | 'DOCX' | 'TXT' | 'MD' | 'LINK';
  url: string;           // storage path for files; external URL for links
  fileSizeKb: number | null;  // null for LINK type
  linkCount: number;     // bookmark count (NOT a URL — it is a counter)
  isBookmarked: boolean; // whether the current user has bookmarked this
  createdAt: string;
  updatedAt: string;
}
```

> **`linkCount`** is the number of users who bookmarked this material, displayed as a counter with a bookmark icon. It is not a link URL.

**GET `/api/v1/materials/space/{spaceId}/search`** query params:
- `query` (optional) — substring in title or description
- `resourceType` (optional) — one of `PDF`, `DOCX`, `TXT`, `MD`, `DOC`, `LINK`
- `sortBy` (optional) — `"linkCount"` or `"createdAt"` (default)
- `sortDir` (optional) — `"asc"` or `"desc"` (default)
- `page` (default 0)
- `size` (default 20)

**PATCH `/api/v1/materials/{materialId}`** — Request body:
```ts
{
  title?: string;       // max 255 chars
  description?: string; // max 1000 chars
}
// Null fields are ignored (PATCH semantics).
```

**GET `/api/v1/materials/{materialId}/download`**:
- Returns a binary file stream with `Content-Disposition: attachment` header.
- Calling this on a `LINK` type material returns `400`. Check `resourceType` first.
- Use `window.open('/api/v1/materials/{materialId}/download')` or `<a href="...">` with auth headers via a token query param — **or** proxy the download through an API call and use a Blob URL:

```ts
const response = await api.get(`/api/v1/materials/${materialId}/download`, {
  responseType: 'blob',
});
const url = URL.createObjectURL(response.data);
const a = document.createElement('a');
a.href = url;
a.download = material.title;
a.click();
URL.revokeObjectURL(url);
```

#### Business Logic

- Only space members can view or upload materials.
- Only the uploader can edit or delete a material.
- Bookmarking awards XP to the material owner (3 XP). Unbookmarking revokes it.
- After bookmarking/unbookmarking, invalidate the TanStack Query cache for the materials list so `isBookmarked` and `linkCount` refresh.
- For LINK type materials: clicking the card opens the URL in a new tab (`window.open(material.url, '_blank')`). Do not show a download button.
- For file type materials: show a download button. On click, trigger the download flow above.

---

### 9.6 Notifications

> **Known issue:** The notification controller may have duplicated base path in some route mappings. Always verify the exact paths against Swagger before building this feature.

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| GET | `/api/v1/notifications/all-notifications?page=0&size=10` | Yes | List notifications (newest first, query-param pagination) |
| PUT | `/api/v1/notifications/mark-read/{notificationId}` | Yes | Mark one notification as read |
| PUT | `/api/v1/notifications/toggle-email` | Yes | Toggle email notification preference |
| PUT | `/api/v1/notifications/toggle-inapp` | Yes | Toggle in-app notification preference |

#### Response Shape

**NotificationResponse:**
```ts
{
  id: string;
  senderId: string | null;      // null for system notifications
  senderName: string | null;
  notificationType: string;     // 'IN_APP' or 'IN_APP_AND_EMAIL'
  title: string;
  message: string;
  referenceType: string;        // 'NEW_POST' | 'NEW_MATERIAL' | 'UPVOTE' | 'GOOD_QUESTION' | 'NEW_ANSWER' | 'ANSWER_ACCEPTED'
  referenceId: string | null;   // UUID of the related entity
  isRead: boolean;
  createdAt: string;
}
```

#### Notification Deep-Linking

Use `referenceType` + `referenceId` to build navigation targets when a notification is clicked:

```ts
function buildNotificationLink(referenceType: string, referenceId: string | null): string {
  if (!referenceId) return '/notifications';
  switch (referenceType) {
    case 'NEW_POST':
    case 'GOOD_QUESTION':
    case 'NEW_ANSWER':
    case 'ANSWER_ACCEPTED':
      return `/posts/${referenceId}`;
    case 'NEW_MATERIAL':
      return `/materials/${referenceId}`;
    case 'UPVOTE':
      // referenceId may be a post or an answer — handle gracefully
      return `/posts/${referenceId}`;
    default:
      return '/notifications';
  }
}
```

On notification click: call `PUT /mark-read/{notificationId}`, then navigate to the deep-link target.

#### Unread Badge

Use `countByRecipientIdAndIsReadFalse` (backend computed). Fetch the notification list and count items where `isRead === false`. Poll or refresh on navigation events to keep the badge accurate.

#### Page: Notifications (`/notifications`)

- Display all user notifications, newest first, paginated
- Each notification shows: sender avatar (or system icon if no sender), title, message, creation time (formatted with `date-fns`)
- Unread notifications visually highlighted
- Click navigates to the deep-link target and marks as read
- No unread/read filter UI is required (backend returns all together)

#### Component: Notification Bell

- Appears in the sidebar or top area
- Shows an unread count badge
- On click: navigates to `/notifications` page

---

### 9.7 Gamification

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| GET | `/api/v1/gamification/me` | Yes | Get current user's gamification profile |
| GET | `/api/v1/gamification/leaderboard?limit=20` | Yes | System-wide leaderboard (top N by XP) |
| GET | `/api/v1/gamification/leaderboard/spaces/{spaceId}?limit=20` | Yes (member) | Space leaderboard |

#### Response Shapes

**GamificationProfileResponse:**
```ts
{
  xpPoints: number;
  level: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate: string;   // ISO date (YYYY-MM-DD)
  totalPosts: number;
  totalAnswers: number;
  totalMaterialsShared: number;
  totalUpvotesReceived: number;
}
```

**SystemLeaderboardEntry:**
```ts
{
  rank: number;
  userId: string;
  fullName: string;
  xpPoints: number;
  level: number;
}
```

**SpaceLeaderboardEntry:**
```ts
{
  rank: number;
  userId: string;
  fullName: string;
  xpPoints: number;
  level: number;
  postsInSpace: number;
  answersInSpace: number;
  materialsInSpace: number;
}
```

#### XP Progress Bar

To compute the progress bar in the profile, use the level formula:

```ts
// Level formula from backend XpCalculator:
// level = Math.floor(1 + Math.sqrt(xp / 100))
// XP threshold for level N: (N - 1)^2 * 100

function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

function getProgressPercent(xp: number, level: number): number {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);
}
```

#### Page: System Leaderboard (`/leaderboard`)

- Ranked list of top users by XP (system-wide)
- Current user's rank shown separately on the side
- Hints box: how to earn XP (see Section 14 for the XP table)

---

### 9.8 Course Registrations

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| POST | `/api/v1/courses` | Yes | Register a new course |
| GET | `/api/v1/courses/current` | Yes | List active registrations (`isCurrent = true`) |
| GET | `/api/v1/courses/all` | Yes | List all registrations (active + past) |
| GET | `/api/v1/courses/{id}` | Yes | Get one registration |
| PATCH | `/api/v1/courses/{id}` | Yes (owner only) | Update a registration |
| DELETE | `/api/v1/courses/{id}` | Yes (owner only) | Delete a registration |

#### Request / Response Shapes

**POST `/api/v1/courses`** — Request body:
```ts
{
  courseCode: string;    // required, must be unique per user/year/semester
  courseName: string;    // required
  semester: string;      // required (e.g., "Fall", "Spring")
  academicYear: string;  // required (e.g., "2025/2026")
}
// On duplicate: 409 Conflict
```

**PATCH `/api/v1/courses/{id}`** — Request body (partial, null fields ignored):
```ts
{
  grade?: string | null;    // e.g., "A+", "B"
  result?: string | null;   // e.g., "PASS", "FAIL"
  isCurrent?: boolean;      // false = archive this course
}
```

**CourseRegistrationResponse:**
```ts
{
  id: string;
  userId: string;
  courseCode: string;
  courseName: string;
  semester: string;
  academicYear: string;
  grade: string | null;      // null if still in progress
  result: string | null;
  isCurrent: boolean;        // true = active enrollment
}
```

#### UI in Profile Page

Displayed inside the **Info tab** of the Profile page. Organized in two sections: **Current Courses** (where `isCurrent = true`) and **Past Courses** (where `isCurrent = false`).

"Register New Course" button → opens a dialog with the registration form.

Each course row shows: course code, course name, semester, academic year, grade (or "In Progress"), and action buttons (edit, archive/delete).

---

### 9.9 Recommendations

#### Endpoints

| Method | Path | Auth Required | Purpose |
|--------|------|:---:|---------|
| GET | `/api/v1/recommendations/spaces` | Yes | Get personalized space recommendations |
| `Planned` | `/api/v1/recommendations/courses` | — | Not yet implemented |
| `Planned` | `/api/v1/recommendations/department` | — | Not yet implemented |

#### Response Shape

**SpaceRecommendationResponse:**
```ts
{
  space: SpaceResponse;
  score: number;          // ranking score
  methodCount: number;    // how many signals recommended this space (1–3)
  reasons: string[];      // human-readable reason strings
}
```

The endpoint returns a ranked list of `SpaceRecommendationResponse[]`.

#### Usage

Used on the Discover page as the default view before the user performs a search. Render the recommended spaces as `SpaceCard` components sorted by `score` (highest first). Each card can optionally show the `reasons` as small badges.

---

## 10. Shared UI Component Specs

### SideBar

- Always visible on the left across all authenticated pages
- Navigation items (top to bottom):
  1. Home (`/`)
  2. Discover (`/discover`)
  3. Online Courses (`/online-courses`) ← static external content page
  4. Leaderboard (`/leaderboard`)
  5. Profile (`/profile`)
  6. Notifications (`/notifications`) ← shows unread badge count
  7. About Us (`/about`) ← at the very bottom

### SpaceCard

Fields to display:
- Space name (title)
- Description (truncated to 2–3 lines)
- Category badge
- Member count with icon
- Join button (visible if not a member)
- If member: clicking the card navigates to `/spaces/{spaceId}`
- If not a member: clicking the card shows a join prompt or the join button

### PostCard

Fields to display:
- Author avatar/initials + author name
- Posting date (formatted with `date-fns`)
- Post title
- Post body (truncated to ~3 lines)
- "Good Question" button + counter (disabled for post author; show as toggled if `hasVoted = true`)
- "Answers" button + answer count (clicking navigates to `/posts/{postId}`)
- First 3 most-relevant answers shown inline (ordered by upvote count, then creation date)
- Answer input field + submit button (visible inline on the post card)

### AnswerCard

Fields to display:
- Author avatar/initials + author name
- Answer creation date
- Answer body
- Upvote button + upvote counter
  - Disabled if user is the answer author
  - Toggled state if `hasUpvoted = true`
- Accept answer button (only visible to the post author, and only if the post is not yet solved)
- Accepted badge (if `isAccepted = true`)

### MaterialFileCard

Fields to display:
- File type icon (relevant to `resourceType`: PDF, DOCX, DOC, TXT, MD)
- Uploader name
- File name (title)
- Description (truncated)
- File type badge (e.g., "PDF")
- Upload date
- Bookmark count with icon (`linkCount`)
- Download button
- Bookmark toggle button (active if `isBookmarked = true`)
- On click: open file preview (for in-browser viewable types) or trigger download

### MaterialLinkCard

Fields to display:
- Uploader name
- Link title
- Description (truncated)
- Upload date
- Bookmark count with icon (`linkCount`)
- Bookmark toggle button (active if `isBookmarked = true`)
- On click: open the URL in a new browser tab (`window.open(material.url, '_blank')`)

### OnlineCourseCard (static/external — not backed by an API endpoint)

Fields to display:
- Source tag with icon (e.g., YouTube, Udemy, Coursera)
- Title
- Description
- Rating (stars)
- Review count with icon
- "Go To →" button linking to the external URL

---

## 11. Route Map

```
/login                         ← public
/register                      ← public
/forgot-password               ← public
/reset-password                ← public (reads ?token= from URL)

/                              ← protected — Home (my spaces)
/discover                      ← protected — Discover/search spaces
/spaces/create                 ← protected — Space creation page
/spaces/:spaceId               ← protected (member only) — Space detail
/spaces/:spaceId/settings      ← protected (admin only) — Space edit (optional)
/posts/:postId                 ← protected (member of the post's space)
/leaderboard                   ← protected — System-wide leaderboard
/profile                       ← protected — User profile + gamification + courses
/notifications                 ← protected — Notification list
/online-courses                ← protected — External courses page (static)
/about                         ← protected — About Us (static)
```

**Protected route wrapper:** Wrap all protected routes with a `<ProtectedRoute>` component that checks for `accessToken` in `localStorage`. If absent, redirect to `/login`.

---

## 12. TypeScript Types (Single Source of Truth)

All types live in `src/lib/types.ts`. Always update this file first when a new endpoint is added.

```ts
// src/lib/types.ts

// ─── API Envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  refreshToken: string;
  user: UserResponse;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  isActive: boolean;
  // Verify additional fields (semester, department, etc.) from Swagger
}

export interface UpdateProfileRequest {
  fullName?: string;
  // Verify additional updatable fields from Swagger
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface GamificationProfileResponse {
  xpPoints: number;
  level: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate: string;           // YYYY-MM-DD
  totalPosts: number;
  totalAnswers: number;
  totalMaterialsShared: number;
  totalUpvotesReceived: number;
}

export interface SystemLeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  xpPoints: number;
  level: number;
}

export interface SpaceLeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  xpPoints: number;
  level: number;
  postsInSpace: number;
  answersInSpace: number;
  materialsInSpace: number;
}

// ─── Spaces ───────────────────────────────────────────────────────────────────

export interface CreateSpaceRequest {
  name: string;
  description: string;
  category: string;           // SpaceCategory enum string
  courseCode?: string;
}

export interface UpdateSpaceRequest {
  name?: string;
  description?: string;
  category?: string;
  courseCode?: string;
}

export interface SpaceResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  courseCode: string | null;
  createdById: string;
  createdByName: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

export interface MembershipResponse {
  id: string;
  spaceId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN';
  joinedAt: string;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface CreatePostRequest {
  title: string;    // 10–300 chars
  body: string;     // min 30 chars
}

export interface EditPostRequest {
  title?: string;
  body?: string;
}

export interface PostResponse {
  id: string;
  spaceId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  isSolved: boolean;
  acceptedAnswerId: string | null;
  viewCount: number;
  goodQuestionCount: number;
  answerCount: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AllPostsResponse {
  // Verify exact shape from Swagger — may be PostResponse[] or a paged wrapper
  posts?: PostResponse[];
  content?: PostResponse[];
  totalPages?: number;
  totalElements?: number;
}

// ─── Answers ──────────────────────────────────────────────────────────────────

export interface CreateAnswerRequest {
  body: string;  // min 10 chars
}

export interface EditAnswerRequest {
  body?: string;
}

export interface AnswerResponse {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvoteCount: number;
  isAccepted: boolean;
  hasUpvoted: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Materials ────────────────────────────────────────────────────────────────

export type ResourceType = 'PDF' | 'DOC' | 'DOCX' | 'TXT' | 'MD' | 'LINK';

export interface ShareLinkRequest {
  title: string;          // required, max 255 chars
  description?: string;   // optional, max 1000 chars
  url: string;            // required, must start with http:// or https://, max 1024 chars
}

export interface EditMaterialRequest {
  title?: string;         // max 255 chars
  description?: string;   // max 1000 chars
}

export interface MaterialResponse {
  id: string;
  spaceId: string;
  spaceName: string;
  uploadedById: string;
  uploadedByName: string;
  title: string;
  description: string | null;
  resourceType: ResourceType;
  url: string;
  fileSizeKb: number | null;
  linkCount: number;       // bookmark count — NOT a URL
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string;
  senderId: string | null;
  senderName: string | null;
  notificationType: string;
  title: string;
  message: string;
  referenceType: string;    // ReferenceType enum string
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export interface RegisterCourseRequest {
  courseCode: string;
  courseName: string;
  semester: string;
  academicYear: string;
}

export interface UpdateCourseRegistrationRequest {
  grade?: string | null;
  result?: string | null;
  isCurrent?: boolean;
}

export interface CourseRegistrationResponse {
  id: string;
  userId: string;
  courseCode: string;
  courseName: string;
  semester: string;
  academicYear: string;
  grade: string | null;
  result: string | null;
  isCurrent: boolean;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface SpaceRecommendationResponse {
  space: SpaceResponse;
  score: number;
  methodCount: number;
  reasons: string[];
}
```

---

## 13. Enums

All enums live in `src/lib/enums.ts`. These match the backend Java enums exactly.

```ts
// src/lib/enums.ts

// Space categories — verify the full list from Swagger's enum dropdown
// COLLEGE_COURSE is confirmed from the backend; others need Swagger verification
export const SpaceCategory = {
  COLLEGE_COURSE: 'COLLEGE_COURSE',
  // Add other values here after verifying from Swagger
} as const;
export type SpaceCategory = typeof SpaceCategory[keyof typeof SpaceCategory];

// Accepted file types for material uploads
export const ResourceType = {
  PDF: 'PDF',
  DOC: 'DOC',
  DOCX: 'DOCX',
  TXT: 'TXT',
  MD: 'MD',
  LINK: 'LINK',
} as const;
export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

// Notification reference types — determines deep-link target
export const ReferenceType = {
  NEW_POST: 'NEW_POST',
  NEW_MATERIAL: 'NEW_MATERIAL',
  UPVOTE: 'UPVOTE',
  GOOD_QUESTION: 'GOOD_QUESTION',
  NEW_ANSWER: 'NEW_ANSWER',
  ANSWER_ACCEPTED: 'ANSWER_ACCEPTED',
} as const;
export type ReferenceType = typeof ReferenceType[keyof typeof ReferenceType];

// Vote target types (for internal reference — not used in API calls directly)
export const TargetType = {
  POST: 'POST',
  ANSWER: 'ANSWER',
} as const;
export type TargetType = typeof TargetType[keyof typeof TargetType];

// Membership roles
export const MemberRole = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
} as const;
export type MemberRole = typeof MemberRole[keyof typeof MemberRole];
```

---

## 14. Gamification Reference

### XP Event Table

| Event | XP Awarded | Recipient |
|-------|:----------:|-----------|
| Post created | +10 | Post author |
| Answer given | +15 | Answer author |
| Answer upvoted | +5 | Answer author |
| Good Question vote received | +3 | Post author |
| Answer accepted as solution | +20 | Answer author |
| Material shared (file or link) | +10 | Material owner |
| Material bookmarked by another user | +3 | Material owner |
| Daily login (once per day) | +2 | Current user |
| Streak milestone (7, 15, 30, 100 days) | +15 | Current user |

### Level Formula

```ts
// Level = floor(1 + sqrt(xp / 100))
// XP required to reach level N = (N - 1)^2 * 100

const levelThresholds = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 400 },
  { level: 4, xpRequired: 900 },
  { level: 5, xpRequired: 1600 },
  // ...levels get progressively harder
];
```

### Streak Milestones

Streak bonus (+15 XP) is awarded automatically when the daily streak hits: 7, 15, 30, or 100 consecutive days. No frontend action needed — the backend awards it on login.

### Hints Box Text (for leaderboard and gamification pages)

Show these as a list in the hints box component:
- Post a question in a space → +10 XP
- Answer a question → +15 XP
- Get your answer accepted → +20 XP
- Have your answer upvoted → +5 XP
- Get a "Good Question" vote → +3 XP
- Share a material → +10 XP
- Have your material bookmarked → +3 XP
- Log in daily → +2 XP
- Maintain a streak (7, 15, 30, 100 days) → +15 XP bonus

---

## 15. Error Handling Patterns

### Backend Error Response Shape

All errors return the same `ApiResponse` envelope with `success: false`:
```json
{
  "success": false,
  "message": "Error description here",
  "data": null,
  "timestamp": "..."
}
```

### HTTP Status Code Map

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| 200/201 | Success | Use `response.data.data` |
| 400 | Validation error (bad input) | Show `response.data.message` as a form or toast error |
| 401 | Unauthorized (expired/missing JWT) | Interceptor auto-retries or redirects to `/login` |
| 403 | Forbidden (not a member, not author, etc.) | Show a toast: "You don't have permission" |
| 404 | Resource not found | Show a "Not Found" state in the page |
| 409 | Conflict — duplicate or similar resource | Special handling (see space creation flow) |
| 500 | Server error | Show a generic error toast |

### Centralized Error Handling

Do not handle errors in individual components. Handle them in mutation callbacks and display via `sonner` toasts:

```ts
// In a TanStack Query mutation:
const mutation = useMutation({
  mutationFn: (data) => createPost(spaceId, data),
  onSuccess: () => {
    toast.success('Post created!');
    queryClient.invalidateQueries({ queryKey: ['posts', spaceId] });
  },
  onError: (error) => {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message ?? 'Something went wrong';
      toast.error(msg);
    }
  },
});
```

### 409 Conflict Special Cases

There are two distinct cases for `409`:

1. **Space creation conflict** — `data` contains a list of similar spaces. Handle with the conflict UI flow (see Section 9.3), not a toast.
2. **Duplicate resource (course registration, vote, etc.)** — show `response.data.message` as a toast error.

Distinguish them by checking which endpoint returned the 409.

---

## 16. Best Practices

- API logic in `services/` only. Components call hooks; hooks call service functions.
- TanStack Query for all server state. Never use `useEffect` for data fetching.
- React Hook Form for all forms. Never manage form state manually with `useState`.
- Zod for all form validation. Align Zod constraints with the backend Bean Validation rules documented in each section above.
- Keep all backend DTO types in `src/lib/types.ts`. Update this file first when a new endpoint is added.
- Always unwrap `ApiResponse.data` in service functions.
- All `401` handling lives in the Axios interceptor in `api.ts`. Never put token refresh logic in a component.
- Never hardcode UUIDs or IDs. Always read them from API responses.
- Avoid `any` in TypeScript. Every API call's return type should be defined in `lib/types.ts`.
- After any write operation (create, update, delete, bookmark, vote), invalidate the relevant TanStack Query cache keys so the UI stays in sync.
- Use `sonner` toasts for all success and error feedback. Do not use `alert()`.
- After logout (single or all-device), clear `localStorage` fully and redirect to `/login`.
- After password change, clear `localStorage` and redirect to `/login` (backend revokes all refresh tokens).
- After password reset, redirect to `/login`.
- The sole admin of a space cannot leave. Before showing a "Leave Space" UI, check if the current user is the only admin (derive from the membership data or catch the 400 error gracefully).
- For admin-only controls (Edit Space, Promote Member), read the user's role from the `MembershipResponse` cached after joining.
- Never request more than 100 items per page (backend max).

---

## 17. AI Prompt Styles

Use these prompt styles when asking an AI to generate or improve frontend code for this project.

**Component generation:**
```
Create a React + TypeScript [component name] using shadcn/ui, Tailwind CSS, React Hook Form, and Zod.
Connect it to the Spring Boot endpoint [METHOD PATH].
Use the TypeScript type [TypeName] from lib/types.ts.
Add loading, error, and empty states. Make it responsive.
```

**API service function:**
```
Create a TypeScript service function for [API endpoint].
It should call the Axios instance from services/api.ts, unwrap ApiResponse<T>, and return a typed Promise<T>.
```

**TanStack Query hook:**
```
Create a TanStack Query [useQuery | useMutation] hook for [endpoint].
Use the service function from services/[feature].service.ts.
Include proper cache key, error handling, and cache invalidation on success.
```

**Space creation with conflict flow:**
```
Build the space creation page with duplicate detection.
On 409 from POST /api/v1/spaces?force=0, display the list of similar spaces in a conflict state UI.
Let the user confirm by re-submitting with force=1 or cancel to modify the form.
Use TanStack Query mutation and shadcn Dialog.
```

**Feature page:**
```
Build the [feature] page for the Covalent GP app.
It connects to [list of endpoints]. Use the types from lib/types.ts.
Use TanStack Query for data fetching, shadcn/ui components, Tailwind CSS, and React Hook Form for any forms.
Handle loading, error, empty, and success states. Make it responsive and production-ready.
```

**Refactoring:**
```
Refactor this React component to follow best practices for the Covalent GP project.
Improve structure, TypeScript types, separation of API logic into service functions, and reusable component design.
```

**UI polish:**
```
Improve the UI of this page using Tailwind CSS and shadcn/ui.
Keep all existing functionality and API connections. Make it cleaner, more modern, and mobile-responsive.
```

---

*End of Covalent GP Frontend Context File v2.0*