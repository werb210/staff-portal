import { apiFetch } from "./api";

export async function getEvents(params?: { view?: string }) {
  const qs = params?.view ? `?view=${encodeURIComponent(params.view)}` : "";
  const res = await apiFetch(`/events${qs}`);
  if (!res.ok) throw new Error(`GET /events failed: ${res.status}`);
  return res.json();
}
