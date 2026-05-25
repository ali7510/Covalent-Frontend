import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSpaceMaterials,
  getBookmarkedMaterials,
  uploadFile,
  shareLink,
  bookmarkMaterial,
  removeBookmark,
  deleteMaterial,
  updateMaterial,
} from "@/services/materials"
import type { MaterialResponse, PagedResponse, ShareLinkBody, UpdateMaterialBody } from "@/lib/types"

export function useSpaceMaterials(spaceId: string | undefined, page = 0, size = 20) {
  return useQuery<PagedResponse<MaterialResponse>, Error>({
    queryKey: ["spaceMaterials", spaceId, page, size],
    queryFn: () => getSpaceMaterials(spaceId || "", page, size),
    enabled: !!spaceId,
  })
}

export function useBookmarkedMaterials(spaceId: string | undefined, page = 0, size = 20) {
  return useQuery<PagedResponse<MaterialResponse>, Error>({
    queryKey: ["bookmarkedMaterials", spaceId, page, size],
    queryFn: () => getBookmarkedMaterials(spaceId || "", page, size),
    enabled: !!spaceId,
  })
}

export function useUploadFile(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<MaterialResponse, Error, { title: string; file: File; description?: string }>({
    mutationFn: ({ title, file, description }) => uploadFile(spaceId || "", title, file, description),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spaceMaterials", spaceId] })
      }
    },
  })
}

export function useShareLink(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<MaterialResponse, Error, ShareLinkBody>({
    mutationFn: (body) => shareLink(spaceId || "", body),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spaceMaterials", spaceId] })
      }
    },
  })
}

export function useBookmarkMaterial(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (materialId) => bookmarkMaterial(materialId),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spaceMaterials", spaceId] })
        queryClient.invalidateQueries({ queryKey: ["bookmarkedMaterials", spaceId] })
      }
    },
  })
}

export function useRemoveBookmarkMaterial(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (materialId) => removeBookmark(materialId),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spaceMaterials", spaceId] })
        queryClient.invalidateQueries({ queryKey: ["bookmarkedMaterials", spaceId] })
      }
    },
  })
}

export function useUpdateMaterial(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<MaterialResponse, Error, { materialId: string; body: UpdateMaterialBody }>({
    mutationFn: ({ materialId, body }) => updateMaterial(materialId, body),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spaceMaterials", spaceId] })
        queryClient.invalidateQueries({ queryKey: ["bookmarkedMaterials", spaceId] })
      }
    },
  })
}

export function useDeleteMaterial(spaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (materialId) => deleteMaterial(materialId),
    onSuccess: () => {
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ["spaceMaterials", spaceId] })
        queryClient.invalidateQueries({ queryKey: ["bookmarkedMaterials", spaceId] })
      }
    },
  })
}
