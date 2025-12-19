import { apiFetch } from "./api";

export async function getTasks() {
  const res = await apiFetch("/tasks");
  if (!res.ok) throw new Error(`GET /tasks failed: ${res.status}`);
  return res.json();
}
