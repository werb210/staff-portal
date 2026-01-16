import { apiClient, type RequestOptions } from "./client";
import type { ApplicationDetails, ApplicationAuditEvent } from "@/types/application.types";

export type ApplicationSummary = {
  id: string;
  applicant: string;
  status: string;
  submittedAt: string;
};

export type ApplicationDocumentsResponse = {
  id: string;
  name: string;
  category: string;
  status: string;
  uploadedAt?: string;
  size?: number;
  version?: number;
}[];

export const fetchApplications = () => apiClient.get<ApplicationSummary[]>("/applications");

export const fetchApplicationDetails = (id: string, options?: RequestOptions) =>
  apiClient.get<ApplicationDetails>(`/applications/${id}`, options);

export const fetchApplicationDocuments = (id: string, options?: RequestOptions) =>
  apiClient.get<ApplicationDocumentsResponse>(`/applications/${id}/documents`, options);

export const fetchApplicationAudit = (id: string, options?: RequestOptions) =>
  apiClient.get<ApplicationAuditEvent[]>(`/applications/${id}/audit`, options);
