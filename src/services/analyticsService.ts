import axios from "axios";

export const AnalyticsService = {
  getEvents: () => axios.get("/api/analytics/events"),
  getReadiness: () => axios.get("/api/analytics/readiness")
};
