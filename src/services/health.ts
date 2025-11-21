import { http } from "@/lib/http";

export const HealthAPI = {
  ping: () => http.get("/api/_int/health"),
};
