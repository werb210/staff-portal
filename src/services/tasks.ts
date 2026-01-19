import { apiClient } from "@/api/http";

export async function getTasks() {
  return apiClient.get("/tasks");
}
