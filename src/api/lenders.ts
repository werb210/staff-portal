import { apiClient, type RequestOptions } from "./client";
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
  const res = await apiClient.get<Lender[]>("/api/lenders");
  return normalizeArray<Lender>(res);
};

export const fetchLenderMatches = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`, options);

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
