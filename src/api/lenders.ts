import { apiClient, type ListResponse, type RequestOptions } from "./client";
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

const assertEntityHasId = <T extends { id?: string }>(entity: T, context: string): T => {
  const id = entity?.id;
  if (typeof id !== "string" || !id.trim()) {
    throw new Error(`Expected ${context} response to include an id.`);
  }
  return entity;
};

const assertEntitiesHaveIds = <T extends { id?: string }>(entities: T[], context: string) => {
  entities.forEach((entity) => {
    assertEntityHasId(entity, context);
  });
};

export const fetchLenders = async () => {
  const res = await apiClient.getList<Lender>("/lenders");
  if (res.items.length) {
    assertEntitiesHaveIds(res.items, "lender");
  }
  return res.items;
};

export const fetchLenderById = async (id: string) => {
  const lender = await apiClient.get<Lender>(`/lenders/${id}`);
  return assertEntityHasId(lender, "lender");
};

export const createLender = async (payload: LenderPayload) => {
  const lender = await apiClient.post<Lender>(`/lenders`, payload);
  return assertEntityHasId(lender, "lender");
};

export const updateLender = async (id: string, payload: Partial<LenderPayload>) => {
  const lender = await apiClient.put<Lender>(`/lenders/${id}`, payload);
  return assertEntityHasId(lender, "lender");
};

export const fetchLenderProducts = async (lenderId?: string) => {
  const res: ListResponse<LenderProduct> = await apiClient.getList<LenderProduct>(`/lender-products`, {
    params: lenderId ? { lenderId } : undefined
  });
  if (res.items.length) {
    assertEntitiesHaveIds(res.items, "lender product");
  }
  return res.items;
};

export const createLenderProduct = async (payload: LenderProductPayload) => {
  const product = await apiClient.post<LenderProduct>(`/lender-products`, payload);
  return assertEntityHasId(product, "lender product");
};

export const updateLenderProduct = async (productId: string, payload: Partial<LenderProductPayload>) => {
  const product = await apiClient.put<LenderProduct>(`/lender-products/${productId}`, payload);
  return assertEntityHasId(product, "lender product");
};

export const fetchLenderMatches = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`, options);

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
