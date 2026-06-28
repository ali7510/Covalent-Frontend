import api from "./api";
import type { SpaceRecommendationResponse, OnlineCourseResponse } from "../lib/types";

const BASE = "/api/v1/recommendations";

// ---------------------------------------------------------------------------
// Get space recommendations (personalized space suggestions)
// ---------------------------------------------------------------------------
export async function getSpaceRecommendations(): Promise<SpaceRecommendationResponse[]> {
  const res = await api.get(`${BASE}/spaces`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get online course recommendations for the student
// ---------------------------------------------------------------------------
export async function getOnlineCourseRecommendations(): Promise<OnlineCourseResponse[]> {
  const res = await api.get("/api/v1/online-courses");
  return res.data.data;
}
