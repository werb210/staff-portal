import { http } from "./http";

export async function fetchDashboardStats() {
  return http.get("/api/dashboard");
}
