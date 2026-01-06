import { apiClient } from "@/api/client";

export async function getEvents(params?: { view?: string }) {
  const qs = params?.view ? `?view=${encodeURIComponent(params.view)}` : "";
  const { data } = await apiClient.get(`/events${qs}`);
  return data;
}
