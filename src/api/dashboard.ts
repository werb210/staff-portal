import api from "./client";

export async function fetchDashboardStats() {
  const { data } = await api.get("/api/dashboard");
  return data;
}
