import { api } from "@/lib/http";

export async function getTags() {
  const res = await api.get<string[]>("/tags");
  return res.data;
}
