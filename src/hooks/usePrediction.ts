import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getQuestionnaire,
  scoreQuestionnaire,
  predictDepartment,
} from "@/services/prediction";
import type {
  QuestionnaireResponse,
  QuestionnaireAnswersRequest,
  QuestionnaireScoreResponse,
  PredictionResponse,
} from "@/lib/types";

export function useQuestionnaire() {
  return useQuery<QuestionnaireResponse, Error>({
    queryKey: ["questionnaire"],
    queryFn: getQuestionnaire,
    staleTime: 24 * 60 * 60 * 1000, // questionnaire text changes very rarely
  });
}

export function useScoreQuestionnaire() {
  return useMutation<
    QuestionnaireScoreResponse,
    Error,
    QuestionnaireAnswersRequest
  >({
    mutationFn: (body) => scoreQuestionnaire(body),
  });
}

export function usePredictDepartment() {
  return useMutation<PredictionResponse, Error, Record<string, number>>({
    mutationFn: (scores) => predictDepartment(scores),
  });
}
