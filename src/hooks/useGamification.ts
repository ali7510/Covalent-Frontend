import { useQuery } from "@tanstack/react-query"
import {
  getMyGamificationProfile,
  getSystemLeaderboard,
  getSpaceLeaderboard,
} from "@/services/gamification"
import type {
  GamificationProfileResponse,
  SystemLeaderboardEntry,
  SpaceLeaderboardEntry,
} from "@/lib/types"

export function useMyGamification() {
  return useQuery<GamificationProfileResponse, Error>({
    queryKey: ["gamificationProfile"],
    queryFn: getMyGamificationProfile,
  })
}

export function useSystemLeaderboard(limit = 50) {
  return useQuery<SystemLeaderboardEntry[], Error>({
    queryKey: ["systemLeaderboard", limit],
    queryFn: () => getSystemLeaderboard(limit),
  })
}

export function useSpaceLeaderboard(spaceId: string | undefined, limit = 20) {
  return useQuery<SpaceLeaderboardEntry[], Error>({
    queryKey: ["spaceLeaderboard", spaceId, limit],
    queryFn: () => getSpaceLeaderboard(spaceId!, limit),
    enabled: !!spaceId,
  })
}
