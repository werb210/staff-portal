import { http } from "./http";

export function runBankingAnalysis(applicationId: string) {
  return http.post(`/api/banking/analyze`, { applicationId });
}

export function getBankingSummary(applicationId: string) {
  return http.get(`/api/banking/summary/${applicationId}`);
}

export function getBankingTransactions(applicationId: string) {
  return http.get(`/api/banking/transactions/${applicationId}`);
}
