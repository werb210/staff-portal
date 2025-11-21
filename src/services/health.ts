import api from "../lib/api";

export const HealthAPI = {
  ping: () => api.get("/api/_int/health")
};
