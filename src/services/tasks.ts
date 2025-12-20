import { apiFetch } from "./api";

export async function getTasks() {
  return apiFetch("/tasks");
}
