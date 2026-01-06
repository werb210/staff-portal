import { apiClient } from "@/api/client";

export async function getEvents(params?: { view?: string }) {
  const qs = params?.view ? `?view=${encodeURIComponent(params.view)}` : "";
  return apiClient.get(`/events${qs}`);
}
