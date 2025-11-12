import apiClient from '../hooks/api/axiosClient';
import type {
  LenderMatchPayload,
  LenderMatchSuggestion,
  OCRRequestPayload,
  OCRResponse,
  RiskScorePayload,
  SummarizationPayload,
} from '../types/ai';

export const aiService = {
  extractDocument: async (payload: OCRRequestPayload) =>
    (await apiClient.post<OCRResponse>('/api/ai/ocr', payload)).data,
  summarizeApplication: async (payload: SummarizationPayload) =>
    (await apiClient.post('/api/ai/summarize', payload)).data,
  scoreRisk: async (payload: RiskScorePayload) => (await apiClient.post('/api/ai/risk-score', payload)).data,
  matchLenders: async (payload: LenderMatchPayload) =>
    (await apiClient.post<LenderMatchSuggestion[]>('/api/ai/lender-match', payload)).data,
};
