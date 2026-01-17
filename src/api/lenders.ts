import { apiClient, type RequestOptions } from "./client";
import { normalizeArray } from "@/utils/normalize";
import type {
  DocumentType,
  FundingType,
  LenderStatus,
  ProductType
} from "@/types/lenderManagement.types";

export type Lender = {
  id: string;
  name: string;
  status: LenderStatus;
  regions: string[];
  industries: string[];
  minDealAmount: number;
  maxDealAmount: number;
  fundingTypes: FundingType[];
  internalNotes?: string | null;
  clientVisible: boolean;
};

export type LenderPayload = Omit<Lender, "id">;

export type LenderProduct = {
  id: string;
  lenderId: string;
  status: LenderStatus;
  productType: ProductType;
  name: string;
  minAmount: number;
  maxAmount: number;
  rateRange: string;
  feeStructure: string;
  eligibilityRules: Record<string, unknown> | null;
  rankingScore: number;
  clientVisible: boolean;
  requiredDocuments: DocumentType[];
  optionalDocuments: DocumentType[];
  conditionalRules: Record<string, unknown> | null;
};

export type LenderProductPayload = Omit<LenderProduct, "id" | "lenderId">;

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
  apiClient.patch<Lender>(`/lenders/${id}`, payload);

export const fetchLenderProducts = (lenderId: string) =>
  apiClient.get<LenderProduct[]>(`/lenders/${lenderId}/products`);

export const createLenderProduct = (lenderId: string, payload: LenderProductPayload) =>
  apiClient.post<LenderProduct>(`/lenders/${lenderId}/products`, payload);

export const updateLenderProduct = (
  lenderId: string,
  productId: string,
  payload: Partial<LenderProductPayload>
) => apiClient.patch<LenderProduct>(`/lenders/${lenderId}/products/${productId}`, payload);

export const fetchLenderMatches = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`, options);

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
