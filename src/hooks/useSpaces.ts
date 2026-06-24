import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserSpaces,
  getActiveSpaces,
  searchSpaces,
  getSpace,
  joinSpace,
  leaveSpace,
  createSpace,
  updateSpace,
  promoteToAdmin,
  getSpaceMembers,
} from "@/services/spaces"
import type {
  SearchSpacesParams,
  SpaceResponse,
  PagedResponse,
  MembershipResponse,
  CreateSpaceBody,
  UpdateSpaceBody,
} from "@/lib/types"

export function useUserSpaces() {
  return useQuery<SpaceResponse[], Error>({
    queryKey: ["userSpaces"],
    queryFn: getUserSpaces,
  })
}

export function useActiveSpaces(page = 0, size = 20, enabled = true) {
  return useQuery<SpaceResponse[], Error>({
    queryKey: ["activeSpaces", page, size],
    queryFn: () => getActiveSpaces(page, size),
    enabled,
  })
}

export function useSearchSpaces(params: SearchSpacesParams, enabled = true) {
  return useQuery<SpaceResponse[], Error>({
    queryKey: ["spaces", "search", params],
    queryFn: () => searchSpaces(params),
    enabled,
  })
}

export function useSpace(spaceId: string | undefined) {
  return useQuery<SpaceResponse, Error>({
    queryKey: ["space", spaceId],
    queryFn: () => getSpace(spaceId || ""),
    enabled: !!spaceId,
  })
}

export function useJoinSpace() {
  const queryClient = useQueryClient()
  return useMutation<MembershipResponse, Error, string>({
    mutationFn: (spaceId) => joinSpace(spaceId),
    onSuccess: (_, spaceId) => {
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["space", spaceId] })
      queryClient.invalidateQueries({ queryKey: ["activeSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["spaces", "search"] })
    },
  })
}

export function useLeaveSpace() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (spaceId) => leaveSpace(spaceId),
    onSuccess: (_, spaceId) => {
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["space", spaceId] })
      queryClient.invalidateQueries({ queryKey: ["activeSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["spaces", "search"] })
    },
  })
}

export function useCreateSpace() {
  const queryClient = useQueryClient()
  return useMutation<SpaceResponse, Error, { body: CreateSpaceBody; force?: boolean }>({
    mutationFn: ({ body, force }) => createSpace(body, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["activeSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["spaces", "search"] })
    },
  })
}

export function useUpdateSpace() {
  const queryClient = useQueryClient()
  return useMutation<SpaceResponse, Error, { spaceId: string; body: UpdateSpaceBody }>({
    mutationFn: ({ spaceId, body }) => updateSpace(spaceId, body),
    onSuccess: (_, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["space", spaceId] })
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] })
    },
  })
}

export function usePromoteToAdmin() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { spaceId: string; memberId: string }>({
    mutationFn: ({ spaceId, memberId }) => promoteToAdmin(spaceId, memberId),
    onSuccess: (_, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["space", spaceId] })
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] })
      queryClient.invalidateQueries({ queryKey: ["spaceMembers", spaceId] })
    },
  })
}

export function useSpaceMembers(spaceId: string | undefined) {
  return useQuery<MembershipResponse[], Error>({
    queryKey: ["spaceMembers", spaceId],
    queryFn: () => getSpaceMembers(spaceId || ""),
    enabled: !!spaceId,
  })
}
