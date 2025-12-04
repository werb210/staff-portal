import { api } from "@/lib/http";

export interface Product {
  id: string;
  name: string;
  category: string;
}

export async function listProducts() {
  const res = await api.get<Product[]>("/products");
  return res.data;
}
