import api from "./api";
import type {
  GamificationProfileResponse,
  SystemLeaderboardEntry,
  SpaceLeaderboardEntry,
} from "../lib/types";

const BASE = "/api/v1/gamification";

// ---------------------------------------------------------------------------
// Get the authenticated user's gamification profile (XP, level, streaks…)
// ---------------------------------------------------------------------------
export async function getMyGamificationProfile(): Promise<GamificationProfileResponse> {
  const res = await api.get(`${BASE}/me`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get the platform-wide leaderboard
// limit: how many entries to return (default 50)
// ---------------------------------------------------------------------------
export async function getSystemLeaderboard(
  limit = 50
): Promise<SystemLeaderboardEntry[]> {
  const res = await api.get(`${BASE}/leaderboard`, { params: { limit } });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get the leaderboard for a single space
// limit: how many entries to return (default 20)
// ---------------------------------------------------------------------------
export async function getSpaceLeaderboard(
  spaceId: string,
  limit = 20
): Promise<SpaceLeaderboardEntry[]> {
  const res = await api.get(`${BASE}/leaderboard/spaces/${spaceId}`, {
    params: { limit },
  });
  return res.data.data;
}