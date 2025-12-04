import { api } from "@/lib/http";

export interface Company {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
}

export async function listCompanies() {
  const res = await api.get<Company[]>("/companies");
  return res.data;
}

export async function getCompany(id: string) {
  const res = await api.get<Company>(`/companies/${id}`);
  return res.data;
}

export async function createCompany(payload: Partial<Company>) {
  const res = await api.post<Company>("/companies", payload);
  return res.data;
}

export async function updateCompany(id: string, payload: Partial<Company>) {
  const res = await api.put<Company>(`/companies/${id}`, payload);
  return res.data;
}

export async function deleteCompany(id: string) {
  await api.delete(`/companies/${id}`);
}
