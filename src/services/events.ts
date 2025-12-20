import { apiFetch } from "./api";

export async function getEvents(params?: { view?: string }) {
  const qs = params?.view ? `?view=${encodeURIComponent(params.view)}` : "";
  return apiFetch(`/events${qs}`);
}
