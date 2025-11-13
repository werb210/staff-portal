import { apiClient } from "./client";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: string;
}

/**
 * GET /api/contacts
 * Backend returns: { data: Contact[] }
 */
export const getContacts = async (): Promise<Contact[]> => {
  const { data } = await apiClient.get<{ data: Contact[] }>("/api/contacts");
  return data.data;
};

/**
 * GET /api/contacts/:id
 * Backend returns: { data: Contact }
 */
export const getContact = async (id: string): Promise<Contact> => {
  const { data } = await apiClient.get<{ data: Contact }>(
    `/api/contacts/${id}`
  );
  return data.data;
};

/**
 * POST /api/contacts
 * Backend returns: { data: Contact }
 */
export const createContact = async (
  input: ContactInput
): Promise<Contact> => {
  const { data } = await apiClient.post<{ data: Contact }>(
    "/api/contacts",
    input
  );
  return data.data;
};

/**
 * PUT /api/contacts/:id
 * Backend returns: { data: Contact }
 */
export const updateContact = async (
  id: string,
  input: ContactInput
): Promise<Contact> => {
  const { data } = await apiClient.put<{ data: Contact }>(
    `/api/contacts/${id}`,
    input
  );
  return data.data;
};

/**
 * DELETE /api/contacts/:id
 * Backend returns: { success: true }
 */
export const deleteContact = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/contacts/${id}`);
};

/**
 * GET /api/contacts/:id/timeline
 * Backend returns: { data: TimelineEvent[] }
 */
export const getContactTimeline = async (id: string): Promise<string[]> => {
  const { data } = await apiClient.get<{ data: string[] }>(
    `/api/contacts/${id}/timeline`
  );
  return data.data;
};
