import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCurrentCourses,
  getAllCourses,
  registerCourse,
  updateCourse,
  deleteCourse,
  getCourseCatalog,
  getGradeMapping,
} from "@/services/courses"
import type {
  CourseRegistrationResponse,
  RegisterCourseBody,
  UpdateCourseBody,
  CourseCatalogWrapper,
  GradeMappingWrapper,
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
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
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
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
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
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

export function useCourseCatalog() {
  return useQuery<CourseCatalogWrapper, Error>({
    queryKey: ["courseCatalog"],
    queryFn: getCourseCatalog,
    staleTime: 24 * 60 * 60 * 1000, // catalog doesn't change often
  })
}

export function useGradeMapping() {
  return useQuery<GradeMappingWrapper, Error>({
    queryKey: ["gradeMapping"],
    queryFn: getGradeMapping,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
