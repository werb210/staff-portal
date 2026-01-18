import { apiClient, type RequestOptions } from "./client";
import { normalizeArray } from "@/utils/normalize";
import type {
  Lender,
  LenderPayload,
  LenderProduct,
  LenderProductPayload
} from "@/types/lenderManagement.models";

export type { Lender, LenderPayload, LenderProduct, LenderProductPayload };

export type LenderMatch = {
  id: string;
  lenderName: string;
  productCategory?: string;
  terms?: string;
  requiredDocsStatus?: string;
};

export const fetchLenders = async () => {
  const res = await apiClient.get<Lender[]>("/lenders");
  return normalizeArray<Lender>(res);
};

export const fetchLenderById = (id: string) => apiClient.get<Lender>(`/lenders/${id}`);

export const createLender = (payload: LenderPayload) => apiClient.post<Lender>(`/lenders`, payload);

export const updateLender = (id: string, payload: Partial<LenderPayload>) =>
  apiClient.put<Lender>(`/lenders/${id}`, payload);

export const fetchLenderProducts = async (lenderId: string) => {
  const res = await apiClient.get<LenderProduct[]>(`/lender-products`, { params: { lenderId } });
  return normalizeArray<LenderProduct>(res);
};

export const createLenderProduct = (payload: LenderProductPayload) =>
  apiClient.post<LenderProduct>(`/lender-products`, payload);

export const updateLenderProduct = (productId: string, payload: Partial<LenderProductPayload>) =>
  apiClient.put<LenderProduct>(`/lender-products/${productId}`, payload);

export const fetchLenderMatches = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`, options);

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
