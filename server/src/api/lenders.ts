import { api } from "@/lib/http";

export interface LenderProduct {
  id: string;
  lenderId: string;
  name: string;
  rate: number;
  maxAmount: number;
}

export async function listLenderProducts() {
  const res = await api.get<LenderProduct[]>("/lenders/products");
  return res.data;
}

export async function updateLenderProduct(id: string, payload: Partial<LenderProduct>) {
  const res = await api.put(`/lenders/products/${id}`, payload);
  return res.data;
}
