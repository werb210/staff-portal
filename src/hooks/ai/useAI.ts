import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../services/aiService';
import type {
  LenderMatchPayload,
  LenderMatchSuggestion,
  OCRRequestPayload,
  RiskScorePayload,
  SummarizationPayload,
} from '../../types/ai';

export function useOCRExtraction() {
  return useMutation({
    mutationFn: (payload: OCRRequestPayload) => aiService.extractDocument(payload),
  });
}

export function useSummarizeApplication() {
  return useMutation({
    mutationFn: (payload: SummarizationPayload) => aiService.summarizeApplication(payload),
  });
}

export function useRiskScoring() {
  return useMutation({
    mutationFn: (payload: RiskScorePayload) => aiService.scoreRisk(payload),
  });
}

export function useLenderMatching() {
  return useMutation({
    mutationFn: (payload: LenderMatchPayload) => aiService.matchLenders(payload),
    onSuccess: (data: LenderMatchSuggestion[]) => data,
  });
}
