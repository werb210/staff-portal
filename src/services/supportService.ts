import axios from "axios";

export const SupportService = {
  listEscalations: () => axios.get("/api/support/escalations"),
  listIssues: () => axios.get("/api/support/issues")
};
