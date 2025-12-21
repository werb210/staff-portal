import { apiClient } from "./client";
import { normalizeArray } from "@/utils/normalize";

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

export const fetchLenders = async () => {
  const res = await apiClient.get("/api/lenders");
  return normalizeArray<Lender>(res.data);
};

export const fetchLenderMatches = (applicationId: string) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`);

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
