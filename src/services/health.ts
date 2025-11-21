import apiClient from "@/lib/apiClient";

export const HealthAPI = {
  ping: () => apiClient.get("/api/_int/health"),
};
