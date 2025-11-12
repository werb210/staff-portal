export interface OCRRequestPayload {
  documentId: string;
  fileUrl: string;
}

export interface OCRResponse {
  documentId: string;
  fields: Record<string, string>;
  confidence: number;
}

export interface SummarizationPayload {
  applicationId: string;
  notes: string;
}

export interface RiskScorePayload {
  applicationId: string;
  financials: Record<string, number>;
}

export interface LenderMatchPayload {
  applicationId: string;
  criteria: Record<string, string | number>;
}

export interface LenderMatchSuggestion {
  lenderId: string;
  score: number;
  rationale: string;
}
