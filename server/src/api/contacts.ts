import { api } from "@/lib/http";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId?: string;
  createdAt: string;
}

export async function listContacts() {
  const res = await api.get<Contact[]>("/contacts");
  return res.data;
}

export async function getContact(id: string) {
  const res = await api.get<Contact>(`/contacts/${id}`);
  return res.data;
}

export async function createContact(payload: Partial<Contact>) {
  const res = await api.post<Contact>("/contacts", payload);
  return res.data;
}

export async function updateContact(id: string, payload: Partial<Contact>) {
  const res = await api.put<Contact>(`/contacts/${id}`, payload);
  return res.data;
}

export async function deleteContact(id: string) {
  await api.delete(`/contacts/${id}`);
}
