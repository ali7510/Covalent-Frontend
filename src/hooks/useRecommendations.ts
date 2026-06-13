import { useQuery } from "@tanstack/react-query"
import { getSpaceRecommendations } from "@/services/recommendations"
import type { SpaceRecommendationResponse } from "@/lib/types"

export function useSpaceRecommendations() {
  return useQuery<SpaceRecommendationResponse[], Error>({
    queryKey: ["spaceRecommendations"],
    queryFn: getSpaceRecommendations,
  })
}
