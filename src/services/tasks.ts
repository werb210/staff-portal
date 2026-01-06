import { apiClient } from "@/api/client";

export async function getTasks() {
  const { data } = await apiClient.get("/tasks");
  return data;
}
