import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../services/aiService';
import { useAIStore } from '../../store/aiStore';
import type {
  AISummaryRecord,
  LenderMatchPayload,
  LenderMatchSuggestion,
  OCRRequestPayload,
  OCRResponse,
  RiskScorePayload,
  RiskScoreRecord,
  SummarizationPayload,
} from '../../types/ai';

export function useOCRExtraction() {
  const { addExtraction } = useAIStore();
  return useMutation({
    mutationFn: (payload: OCRRequestPayload) => aiService.extractDocument(payload),
    onSuccess: (response: OCRResponse) => {
      addExtraction(response);
    },
  });
}

export function useSummarizeApplication() {
  const { addSummary } = useAIStore();
  return useMutation({
    mutationFn: (payload: SummarizationPayload) => aiService.summarizeApplication(payload),
    onSuccess: (summary: AISummaryRecord) => {
      addSummary(summary);
    },
  });
}

export function useRiskScoring() {
  const { addRiskScore } = useAIStore();
  return useMutation({
    mutationFn: (payload: RiskScorePayload) => aiService.scoreRisk(payload),
    onSuccess: (record: RiskScoreRecord) => {
      addRiskScore(record);
    },
  });
}

export function useLenderMatching() {
  const { setLenderMatches } = useAIStore();
  return useMutation({
    mutationFn: (payload: LenderMatchPayload) => aiService.matchLenders(payload),
    onSuccess: (data: LenderMatchSuggestion[]) => {
      setLenderMatches(data);
    },
  });
}
