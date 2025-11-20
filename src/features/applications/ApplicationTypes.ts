export type Application = {
  id: string;
  applicantName?: string;
  businessName?: string;
  status?: string;
  createdAt?: string;
};

export type ApplicationDocument = {
  id: string;
  name: string;
  category: string;
  downloadUrl: string;
  status?: string;
};

export type OcrInsights = Record<string, unknown>;

export type BankingAnalysis = Record<string, unknown>;

export type Financials = Record<string, unknown>;

export type LenderMatch = {
  id: string;
  name: string;
  matchScore: number;
};
