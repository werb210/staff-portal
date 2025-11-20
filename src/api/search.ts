// src/api/search.ts
import api from "../lib/api";

export async function globalSearch(query: string) {
  const res = await api.get("/search", { params: { q: query } });
  return res.data;
}
