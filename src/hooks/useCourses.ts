import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCurrentCourses,
  getAllCourses,
  registerCourse,
  updateCourse,
  deleteCourse,
} from "@/services/courses"
import type {
  CourseRegistrationResponse,
  RegisterCourseBody,
  UpdateCourseBody,
} from "@/lib/types"

export function useCurrentCourses() {
  return useQuery<CourseRegistrationResponse[], Error>({
    queryKey: ["currentCourses"],
    queryFn: getCurrentCourses,
  })
}

export function useAllCourses() {
  return useQuery<CourseRegistrationResponse[], Error>({
    queryKey: ["allCourses"],
    queryFn: getAllCourses,
  })
}

export function useRegisterCourse() {
  const queryClient = useQueryClient()
  return useMutation<CourseRegistrationResponse, Error, RegisterCourseBody>({
    mutationFn: (body) => registerCourse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentCourses"] })
      queryClient.invalidateQueries({ queryKey: ["allCourses"] })
    },
  })
}

export function useUpdateCourseRegistration() {
  const queryClient = useQueryClient()
  return useMutation<CourseRegistrationResponse, Error, { id: string; body: UpdateCourseBody }>({
    mutationFn: ({ id, body }) => updateCourse(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentCourses"] })
      queryClient.invalidateQueries({ queryKey: ["allCourses"] })
    },
  })
}

export function useDeleteCourseRegistration() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentCourses"] })
      queryClient.invalidateQueries({ queryKey: ["allCourses"] })
    },
  })
}
