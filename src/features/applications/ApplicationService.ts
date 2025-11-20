import api from "../../lib/api";
import {
  Application,
  ApplicationDocument,
  BankingAnalysis,
  Financials,
  LenderMatch,
  OcrInsights,
} from "./ApplicationTypes";

export async function getApplication(appId: string): Promise<Application> {
  const res = await api.get<Application>(`/api/applications/${appId}`);
  return res.data;
}

export async function getApplicationDocuments(
  appId: string,
): Promise<ApplicationDocument[]> {
  const res = await api.get<ApplicationDocument[]>(
    `/api/documents/byApplication/${appId}`,
  );
  return res.data;
}

export async function acceptDocument(docId: string): Promise<void> {
  await api.post(`/api/documents/${docId}/accept`);
}

export async function rejectDocument(
  docId: string,
  category: string,
): Promise<void> {
  await api.post(`/api/documents/${docId}/reject`, { category });
}

export async function resendToLender(
  appId: string,
  lenderId: string,
): Promise<void> {
  await api.post(`/api/lenders/send`, { appId, lenderId });
}

export async function getOcrInsights(appId: string): Promise<OcrInsights> {
  const res = await api.get<OcrInsights>(`/api/ocr/${appId}`);
  return res.data;
}

export async function getBankingAnalysis(
  appId: string,
): Promise<BankingAnalysis> {
  const res = await api.get<BankingAnalysis>(`/api/financials/banking/${appId}`);
  return res.data;
}

export async function getFinancials(appId: string): Promise<Financials> {
  const res = await api.get<Financials>(`/api/financials/${appId}`);
  return res.data;
}

export async function getLenderMatches(appId: string): Promise<LenderMatch[]> {
  const res = await api.get<LenderMatch[]>(`/api/lenders/matches/${appId}`);
  return res.data;
}
