import { useParams } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import { useSpace } from "./useSpaces"

/**
 * Resolves the current space from the URL params, fetches its details,
 * and exposes whether the authenticated user is an admin/creator of that space.
 */
export function useCurrentSpace() {
  const { spaceId } = useParams<{ spaceId: string }>()
  const { user } = useAuth()

  const { data: space, isLoading, isError } = useSpace(spaceId)

  // The user is considered an admin if they created the space.
  // When the backend exposes membership roles, this can be refined further.
  const isAdmin = !!(user && space && space.createdById === user.id)

  return {
    spaceId,
    space,
    isLoading,
    isError,
    isAdmin,
  }
}
