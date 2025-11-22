import api from "@/lib/api/http";

export interface ApplicationDocument {
  id: string;
  fileName: string;
  category?: string;
}

export interface ApplicationSummary {
  id: string;
  businessName: string;
  status: string;
  createdAt: string;
}

export interface ApplicationsResponse {
  applications: ApplicationSummary[];
  total: number;
}

export interface ApplicationDetail extends ApplicationSummary {
  useOfFunds?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  documents?: ApplicationDocument[];
}

export async function fetchApplications(
  page = 1,
  limit = 25
): Promise<ApplicationsResponse> {
  const res = await api.get("/api/applications", {
    params: { page, limit }
  });
  return res.data;
}

export async function fetchApplication(id: string): Promise<ApplicationDetail> {
  const res = await api.get(`/api/applications/${id}`);
  return res.data;
}

export async function fetchApplicationFull(id: string): Promise<ApplicationDetail> {
  const res = await api.get(`/api/applications/${id}/full`);
  return res.data;
}
