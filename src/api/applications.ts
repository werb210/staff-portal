import { apiClient, type RequestOptions } from "./client";
import { normalizeArray } from "@/utils/normalize";
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

export const fetchApplications = async () => {
  const res = await apiClient.get<ApplicationSummary[]>("/applications");
  return normalizeArray<ApplicationSummary>(res);
};

export const fetchApplicationDetails = (id: string, options?: RequestOptions) =>
  apiClient.get<ApplicationDetails>(`/applications/${id}`, options);

export const fetchApplicationDocuments = async (id: string, options?: RequestOptions) => {
  const res = await apiClient.get<ApplicationDocumentsResponse>(`/applications/${id}/documents`, options);
  return normalizeArray(res);
};

export const fetchApplicationAudit = async (id: string, options?: RequestOptions) => {
  const res = await apiClient.get<ApplicationAuditEvent[]>(`/applications/${id}/audit`, options);
  return normalizeArray<ApplicationAuditEvent>(res);
};
