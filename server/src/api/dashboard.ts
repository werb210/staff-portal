import { api } from "@/lib/http";

export interface DashboardStats {
  totalDeals: number;
  totalContacts: number;
  totalCompanies: number;
  totalApplications: number;
  pipelineSnapshot: any;
}

export async function getDashboardStats() {
  const res = await api.get<DashboardStats>("/dashboard/stats");
  return res.data;
}
