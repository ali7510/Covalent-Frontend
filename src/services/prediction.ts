import api from "./api";
import type {
  QuestionnaireResponse,
  QuestionnaireAnswersRequest,
  QuestionnaireScoreResponse,
  PredictionResponse,
} from "../lib/types";

// ---------------------------------------------------------------------------
// Get raw questionnaire JSON
// ---------------------------------------------------------------------------
export async function getQuestionnaire(): Promise<QuestionnaireResponse> {
  const res = await api.get("/api/v1/questionnaire");
  if (typeof res.data === "string") {
    return JSON.parse(res.data);
  }
  return res.data;
}

// ---------------------------------------------------------------------------
// Score questionnaire answers
// ---------------------------------------------------------------------------
export async function scoreQuestionnaire(
  body: QuestionnaireAnswersRequest
): Promise<QuestionnaireScoreResponse> {
  const res = await api.post("/api/v1/questionnaire/score", body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Predict the department using scores and course history
// ---------------------------------------------------------------------------
export async function predictDepartment(
  normalizedScores: Record<string, number>
): Promise<PredictionResponse> {
  const res = await api.post("/api/v1/predictions/department", {
    normalizedScores,
  });
  return res.data.data;
}
