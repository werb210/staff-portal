import { apiClient, type RequestOptions } from "./client";

export type CreditSummary = {
  businessOverview?: string;
  industryOverview?: string;
  financialOverview?: string;
  riskAssessment?: string;
  collateralOverview?: string;
  termsSummary?: string;
  pdfUrl?: string;
};

export const fetchCreditSummary = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<CreditSummary>(`/internal/application/${applicationId}/credit-summary`, options);

export const regenerateCreditSummary = (applicationId: string) =>
  apiClient.post(`/internal/application/${applicationId}/credit-summary/regenerate`);
