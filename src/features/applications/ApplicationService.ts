import api from "../../lib/api";

export async function getApplication(appId: string) {
  const res = await api.get(`/api/applications/${appId}`);
  return res.data;
}

export async function getApplicationDocuments(appId: string) {
  const res = await api.get(`/api/documents/byApplication/${appId}`);
  return res.data;
}

export async function acceptDocument(docId: string) {
  await api.post(`/api/documents/${docId}/accept`);
}

export async function rejectDocument(docId: string, category: string) {
  await api.post(`/api/documents/${docId}/reject`, { category });
}

export async function resendToLender(appId: string, lenderId: string) {
  await api.post(`/api/lenders/send`, { appId, lenderId });
}

export async function getOcrInsights(appId: string) {
  const res = await api.get(`/api/ocr/${appId}`);
  return res.data;
}

export async function getBankingAnalysis(appId: string) {
  const res = await api.get(`/api/financials/banking/${appId}`);
  return res.data;
}

export async function getFinancials(appId: string) {
  const res = await api.get(`/api/financials/${appId}`);
  return res.data;
}

export async function getLenderMatches(appId: string) {
  const res = await api.get(`/api/lenders/matches/${appId}`);
  return res.data;
}
