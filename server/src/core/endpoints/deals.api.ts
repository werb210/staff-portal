import apiClient from "@/lib/http";

export interface DealFilters {
  search?: string;
  stage?: string;
  ownerId?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface DealPayload {
  name?: string;
  value?: number;
  stage?: string;
  companyId?: string;
  contactId?: string;
  expectedCloseDate?: string;
}

export const listDeals = <T = unknown>(params?: DealFilters) => apiClient.get<T>("/deals", { params });

export const getDeal = <T = unknown>(dealId: string) => apiClient.get<T>(`/deals/${dealId}`);

export const createDeal = <T = unknown>(payload: DealPayload) => apiClient.post<T>("/deals", payload);

export const updateDeal = <T = unknown>(dealId: string, payload: Partial<DealPayload>) =>
  apiClient.patch<T>(`/deals/${dealId}`, payload);

export const moveDealStage = <T = unknown>(dealId: string, stage: string) =>
  apiClient.post<T>(`/deals/${dealId}/stage`, { stage });
