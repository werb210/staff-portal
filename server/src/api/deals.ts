import { api } from "@/lib/http";

export interface Deal {
  id: string;
  companyId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function listDeals() {
  const res = await api.get<Deal[]>("/deals");
  return res.data;
}

export async function getDeal(id: string) {
  const res = await api.get<Deal>(`/deals/${id}`);
  return res.data;
}

export async function updateDeal(id: string, payload: Partial<Deal>) {
  const res = await api.put<Deal>(`/deals/${id}`, payload);
  return res.data;
}
