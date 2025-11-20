// src/api/lenders.ts
import api from "../lib/api";

export async function fetchLenders() {
  const res = await api.get("/lenders");
  return res.data;
}

export async function fetchLenderProducts(lenderId: string) {
  const res = await api.get(`/lenders/${lenderId}/products`);
  return res.data;
}

export async function sendToLender(applicationId: string, lenderId: string) {
  const res = await api.post(`/lenders/${lenderId}/send`, { applicationId });
  return res.data;
}
