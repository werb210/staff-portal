import { api } from "@/lib/http";

export interface Application {
  id: string;
  companyId: string;
  status: string;
  stage: string;
  createdAt: string;
}

export async function listApplications() {
  const res = await api.get<Application[]>("/applications");
  return res.data;
}

export async function getApplication(id: string) {
  const res = await api.get<Application>(`/applications/${id}`);
  return res.data;
}

export async function updateApplication(id: string, payload: Partial<Application>) {
  const res = await api.put<Application>(`/applications/${id}`, payload);
  return res.data;
}
