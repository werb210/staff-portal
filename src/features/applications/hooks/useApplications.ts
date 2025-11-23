import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/http";

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

async function fetchApplications(page = 1, limit = 25): Promise<ApplicationsResponse> {
  const res = await api.get("/api/applications", {
    params: { page, limit }
  });
  return res.data;
}

export function useApplications(page: number, limit: number) {
  return useQuery({
    queryKey: ["applications", page, limit],
    queryFn: (): Promise<ApplicationsResponse> => fetchApplications(page, limit)
  });
}
