import { useParams } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import { useSpace } from "./useSpaces"

/**
 * Resolves the current space from the URL params, fetches its details,
 * and exposes whether the authenticated user is an admin of that space.
 * Uses the membership role from the backend when available, with a
 * fallback to the createdById check for backwards compatibility.
 */
export function useCurrentSpace() {
  const { spaceId } = useParams<{ spaceId: string }>()
  const { user } = useAuth()

  const { data: space, isLoading, isError } = useSpace(spaceId)

  // Prefer role-based check from membership (role field populated when fetching user's own spaces).
  // Fall back to createdById comparison for spaces viewed by the creator before refresh.
  const isAdmin = !!(
    space &&
    (space.role === "ADMIN" || (user && space.createdById === user.id))
  )

  return {
    spaceId,
    space,
    isLoading,
    isError,
    isAdmin,
  }
}
