import { create } from 'zustand';
import type { AISummaryRecord, LenderMatchSuggestion, OCRResponse, RiskScoreRecord } from '../types/ai';

interface AIState {
  extractions: OCRResponse[];
  summaries: AISummaryRecord[];
  riskScores: RiskScoreRecord[];
  lenderMatches: LenderMatchSuggestion[];
  addExtraction: (extraction: OCRResponse) => void;
  addSummary: (summary: AISummaryRecord) => void;
  addRiskScore: (record: RiskScoreRecord) => void;
  setLenderMatches: (matches: LenderMatchSuggestion[]) => void;
  clear: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  extractions: [],
  summaries: [],
  riskScores: [],
  lenderMatches: [],
  addExtraction: (extraction) => set((state) => ({ extractions: [...state.extractions, extraction] })),
  addSummary: (summary) => set((state) => ({ summaries: [...state.summaries, summary] })),
  addRiskScore: (record) => set((state) => ({ riskScores: [...state.riskScores, record] })),
  setLenderMatches: (matches) => set({ lenderMatches: matches }),
  clear: () => set({ extractions: [], summaries: [], riskScores: [], lenderMatches: [] }),
}));
