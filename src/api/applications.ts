import { apiClient } from "./client";

export type ApplicationSummary = {
  id: string;
  applicant: string;
  status: string;
  submittedAt: string;
};

export const fetchApplications = () => apiClient.get<ApplicationSummary[]>("/applications");
