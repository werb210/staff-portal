import { apiClient } from "@/api/client";

export async function getTasks() {
  return apiClient.get("/tasks");
}
