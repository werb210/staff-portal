import { api } from "@/lib/http";

export async function search(query: string) {
  const res = await api.get("/search", { params: { q: query } });
  return res.data;
}
