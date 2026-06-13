import api from "./api";
import type { SpaceRecommendationResponse } from "../lib/types";

const BASE = "/api/v1/recommendations";

// ---------------------------------------------------------------------------
// Get space recommendations (personalized space suggestions)
// ---------------------------------------------------------------------------
export async function getSpaceRecommendations(): Promise<SpaceRecommendationResponse[]> {
  const res = await api.get(`${BASE}/spaces`);
  return res.data.data;
}
