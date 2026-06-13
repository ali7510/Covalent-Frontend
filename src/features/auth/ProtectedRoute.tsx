import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { Loader2 } from "lucide-react"

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="text-[13px] font-[510] tracking-wide text-muted-foreground animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If authenticated, render nested child routes via Outlet
  return <Outlet />
}
