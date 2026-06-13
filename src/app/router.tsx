import { createBrowserRouter, Navigate } from "react-router-dom"
import AuthPage from "@/features/auth/pages/AuthPage"
import HomePage from "@/features/dashboard/pages/HomePage"
import AboutPage from "@/pages/AboutPage"
import LeaderboardPage from "@/features/gamification/pages/LeaderboardPage"
import NotificationsPage from "@/features/notifications/pages/NotificationsPage"
import OnlineCoursesPage from "@/features/courses/pages/OnlineCoursesPage"
import PostPage from "@/features/posts/pages/PostPage"
import ProfilePage from "@/features/users/pages/ProfilePage"
import SpacePage from "@/features/spaces/pages/SpacePage"
import SpaceSearchPage from "@/features/spaces/pages/SpaceSearchPage"
import CreateSpacePage from "@/features/spaces/pages/CreateSpacePage"
import SpaceSettingsPage from "@/features/spaces/pages/SpaceSettingsPage"

import ProtectedRoute from "@/features/auth/ProtectedRoute"
import PageLayout from "@/components/shared/PageLayout"

export const router = createBrowserRouter([
  // Public Authentication Routes
  { path: "/login", element: <AuthPage /> },
  { path: "/register", element: <AuthPage /> },
  { path: "/forgot-password", element: <AuthPage /> },
  { path: "/reset-password", element: <AuthPage /> },

  // Protected Core Workspace Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PageLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/home", element: <Navigate to="/" replace /> },
          { path: "/discover", element: <SpaceSearchPage /> },
          { path: "/spaces/create", element: <CreateSpacePage /> },
          { path: "/spaces/:spaceId", element: <SpacePage /> },
          { path: "/spaces/:spaceId/settings", element: <SpaceSettingsPage /> },
          { path: "/posts/:postId", element: <PostPage /> },
          { path: "/online-courses", element: <OnlineCoursesPage /> },
          { path: "/leaderboard", element: <LeaderboardPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/about", element: <AboutPage /> },
        ],
      },
    ],
  },

  // Fallback Route for Undefined Paths
  { path: "*", element: <Navigate to="/login" replace /> },
])