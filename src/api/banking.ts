import api from "@/lib/api/client";

export function runBankingAnalysis(applicationId: string) {
  return api.post(`/api/banking/analyze`, { applicationId }).then((res) => res.data);
}

export function getBankingSummary(applicationId: string) {
  return api.get(`/api/banking/summary/${applicationId}`).then((res) => res.data);
}

export function getBankingTransactions(applicationId: string) {
  return api.get(`/api/banking/transactions/${applicationId}`).then((res) => res.data);
}
