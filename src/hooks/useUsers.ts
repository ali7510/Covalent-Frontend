import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateProfile,
  changePassword,
  toggleEmailNotifications,
  toggleInAppNotifications,
} from "@/services/users"
import type { UserResponse, UpdateProfileBody, ChangePasswordBody } from "@/lib/types"

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation<UserResponse, Error, UpdateProfileBody>({
    mutationFn: (body) => updateProfile(body),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["currentUser"], updatedUser)
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordBody>({
    mutationFn: (body) => changePassword(body),
  })
}

export function useToggleEmailPrefs() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: () => toggleEmailNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export function useToggleInAppPrefs() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: () => toggleInAppNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}
