import { apiClient } from './client';

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

export const getContacts = async (): Promise<Contact[]> => {
  const { data } = await apiClient.get<Contact[]>('/contacts');
  return data;
};

export const getContact = async (id: string): Promise<Contact> => {
  const { data } = await apiClient.get<Contact>(`/contacts/${id}`);
  return data;
};

export const createContact = async (input: ContactInput): Promise<Contact> => {
  const { data } = await apiClient.post<Contact>('/contacts', input);
  return data;
};

export const updateContact = async (id: string, input: ContactInput): Promise<Contact> => {
  const { data } = await apiClient.put<Contact>(`/contacts/${id}`, input);
  return data;
};

export const deleteContact = async (id: string): Promise<void> => {
  await apiClient.delete(`/contacts/${id}`);
};

export const getContactTimeline = async (id: string): Promise<string[]> => {
  const { data } = await apiClient.get<string[]>(`/contacts/${id}/timeline`);
  return data;
};
