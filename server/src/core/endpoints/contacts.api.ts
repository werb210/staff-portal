import apiClient from "@/lib/http";

export interface ContactFilters {
  search?: string;
  status?: string;
  ownerId?: string;
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface ContactPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
  companyId?: string;
  tags?: string[];
}

export const listContacts = <T = unknown>(params?: ContactFilters) => apiClient.get<T>("/contacts", { params });

export const getContact = <T = unknown>(contactId: string) => apiClient.get<T>(`/contacts/${contactId}`);

export const createContact = <T = unknown>(payload: ContactPayload) => apiClient.post<T>("/contacts", payload);

export const updateContact = <T = unknown>(contactId: string, payload: Partial<ContactPayload>) =>
  apiClient.patch<T>(`/contacts/${contactId}`, payload);

export const archiveContact = <T = unknown>(contactId: string) => apiClient.post<T>(`/contacts/${contactId}/archive`);
