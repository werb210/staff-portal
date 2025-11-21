import api from "@/lib/api/client";

export async function fetchDashboardStats() {
  return api.get("/api/dashboard").then((res) => res.data);
}
