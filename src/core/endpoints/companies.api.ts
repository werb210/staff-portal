import apiClient from "@/api/client";

export interface CompanyFilters {
  search?: string;
  industry?: string;
  region?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface CompanyPayload {
  name?: string;
  website?: string;
  industry?: string;
  employees?: number;
  ownerId?: string;
  tags?: string[];
}

export const listCompanies = <T = unknown>(params?: CompanyFilters) => apiClient.get<T>("/companies", { params });

export const getCompany = <T = unknown>(companyId: string) => apiClient.get<T>(`/companies/${companyId}`);

export const createCompany = <T = unknown>(payload: CompanyPayload) => apiClient.post<T>("/companies", payload);

export const updateCompany = <T = unknown>(companyId: string, payload: Partial<CompanyPayload>) =>
  apiClient.patch<T>(`/companies/${companyId}`, payload);

export const archiveCompany = <T = unknown>(companyId: string) => apiClient.post<T>(`/companies/${companyId}/archive`);
