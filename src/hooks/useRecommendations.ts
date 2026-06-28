import { useQuery } from "@tanstack/react-query"
import { getSpaceRecommendations, getOnlineCourseRecommendations } from "@/services/recommendations"
import type { SpaceRecommendationResponse, OnlineCourseResponse } from "@/lib/types"

export function useSpaceRecommendations() {
  return useQuery<SpaceRecommendationResponse[], Error>({
    queryKey: ["spaceRecommendations"],
    queryFn: getSpaceRecommendations,
  })
}

export function useOnlineCourseRecommendations() {
  return useQuery<OnlineCourseResponse[], Error>({
    queryKey: ["onlineCourseRecommendations"],
    queryFn: getOnlineCourseRecommendations,
  })
}
