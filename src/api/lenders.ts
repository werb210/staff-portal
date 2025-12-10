import { apiClient } from "./client";

export type Lender = {
  id: string;
  name: string;
  region: string;
};

export type LenderMatch = {
  id: string;
  lenderName: string;
  productCategory?: string;
  terms?: string;
  requiredDocsStatus?: string;
};

export const fetchLenders = () => apiClient.get<Lender[]>("/lenders");

export const fetchLenderMatches = (applicationId: string) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`);

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
