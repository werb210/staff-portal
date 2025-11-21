import api from "@/lib/api/client";

export const HealthAPI = {
  ping: () => api.get("/api/_int/health")
};
