import apiClient from "@/lib/http";

export interface ApplicationFilters {
  status?: string;
  ownerId?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface ApplicationPayload {
  applicantId?: string;
  product?: string;
  amount?: number;
  status?: string;
  metadata?: Record<string, unknown>;
}

export const listApplications = <T = unknown>(params?: ApplicationFilters) =>
  apiClient.get<T>("/applications", { params });

export const getApplication = <T = unknown>(applicationId: string) =>
  apiClient.get<T>(`/applications/${applicationId}`);

export const createApplication = <T = unknown>(payload: ApplicationPayload) =>
  apiClient.post<T>("/applications", payload);

export const updateApplication = <T = unknown>(applicationId: string, payload: Partial<ApplicationPayload>) =>
  apiClient.patch<T>(`/applications/${applicationId}`, payload);

export const submitApplication = <T = unknown>(applicationId: string) =>
  apiClient.post<T>(`/applications/${applicationId}/submit`);

export const closeApplication = <T = unknown>(applicationId: string, payload?: { reason?: string }) =>
  apiClient.post<T>(`/applications/${applicationId}/close`, payload);
