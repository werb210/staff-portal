import { apiClient, type RequestOptions } from "./client";

export type ApplicationSummary = {
  id: string;
  applicant: string;
  status: string;
  submittedAt: string;
};

export type ApplicationDetails = ApplicationSummary & {
  kyc?: Record<string, string | number | boolean>;
  business?: Record<string, string | number | boolean>;
  applicantInfo?: Record<string, string | number | boolean>;
  owners?: Array<Record<string, string | number | boolean>>;
  fundingRequest?: Record<string, string | number | boolean>;
  productCategory?: string;
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
