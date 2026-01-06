import { apiClient, type RequestOptions } from "./client";

export type BankingSummary = {
  avgMonthlyRevenue?: number;
  avgMonthlyExpenses?: number;
  burnRate?: number;
  daysCashOnHand?: number;
  nsfCount?: number;
  volatilityIndex?: number;
  revenueTrend?: Array<{ month: string; revenue: number }>;
  largestDeposits?: Array<{ amount: number; date: string; description?: string }>;
  statementCoverage?: string[];
};

export const fetchBankingSummary = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<BankingSummary>(`/banking/${applicationId}/summary`, options);
