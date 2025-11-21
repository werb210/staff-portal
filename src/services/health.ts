import http from "@/lib/api/http";

export const HealthAPI = {
  ping: () => http.get("/api/_int/health"),
};
