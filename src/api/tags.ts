// src/api/tags.ts
import api from "../lib/api";

export async function getTags() {
  const res = await api.get("/tags");
  return res.data;
}

export async function addTag(name: string) {
  const res = await api.post("/tags", { name });
  return res.data;
}
