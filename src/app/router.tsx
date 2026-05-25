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

import ProtectedRoute from "@/features/auth/ProtectedRoute"
import PageLayout from "@/components/shared/PageLayout"

export const router = createBrowserRouter([
  // Public Redirect
  { path: "/", element: <Navigate to="/login" replace /> },

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
          { path: "/home", element: <HomePage /> },
          { path: "/spaces/search", element: <SpaceSearchPage /> },
          { path: "/spaces/:spaceId", element: <SpacePage /> },
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