import apiClient from '../hooks/api/axiosClient';
import type {
  AISummaryRecord,
  LenderMatchPayload,
  LenderMatchSuggestion,
  OCRRequestPayload,
  OCRResponse,
  RiskScorePayload,
  RiskScoreRecord,
  SummarizationPayload,
} from '../types/ai';

export const aiService = {
  extractDocument: async (payload: OCRRequestPayload) =>
    (await apiClient.post<OCRResponse>('/api/ai/ocr', payload)).data,
  summarizeApplication: async (payload: SummarizationPayload) =>
    (await apiClient.post<AISummaryRecord>('/api/ai/summarize', payload)).data,
  scoreRisk: async (payload: RiskScorePayload) =>
    (await apiClient.post<RiskScoreRecord>('/api/ai/risk-score', payload)).data,
  matchLenders: async (payload: LenderMatchPayload) =>
    (await apiClient.post<LenderMatchSuggestion[]>('/api/ai/lender-match', payload)).data,
};
