import { apiClient, type RequestOptions } from "./client";
import { normalizeArray } from "@/utils/normalize";
import type {
  DocumentType,
  LenderProductCategory,
  RateType,
  SubmissionMethod,
  TermUnit
} from "@/types/lenderManagement.types";

export type LenderAddress = {
  street: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

export type LenderPrimaryContact = {
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
};

export type LenderSubmissionConfig = {
  method: SubmissionMethod;
  apiBaseUrl?: string | null;
  apiClientId?: string | null;
  apiUsername?: string | null;
  apiPassword?: string | null;
  submissionEmail?: string | null;
};

export type LenderOperationalLimits = {
  maxLendingLimit?: number | null;
  maxLtv?: number | null;
  maxLoanTerm?: number | null;
  maxAmortization?: number | null;
};

export type Lender = {
  id: string;
  name: string;
  active: boolean;
  address: LenderAddress;
  phone: string;
  website?: string | null;
  description?: string | null;
  internalNotes?: string | null;
  processingNotes?: string | null;
  primaryContact: LenderPrimaryContact;
  submissionConfig: LenderSubmissionConfig;
  operationalLimits: LenderOperationalLimits;
};

export type LenderPayload = Omit<Lender, "id">;

export type LenderProductTermLength = {
  min: number;
  max: number;
  unit: TermUnit;
};

export type LenderProductEligibilityFlags = {
  minimumRevenue?: number | null;
  timeInBusinessMonths?: number | null;
  industryRestrictions?: string | null;
};

export type LenderProduct = {
  id: string;
  lenderId: string;
  productName: string;
  active: boolean;
  category: LenderProductCategory;
  country: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  interestRateMin: number;
  interestRateMax: number;
  rateType: RateType;
  termLength: LenderProductTermLength;
  minimumCreditScore?: number | null;
  ltv?: number | null;
  eligibilityRules?: string | null;
  eligibilityFlags: LenderProductEligibilityFlags;
  requiredDocuments: DocumentType[];
};

export type LenderProductPayload = Omit<LenderProduct, "id">;

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
