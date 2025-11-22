import apiClient from "@/lib/http";

export interface DashboardFilters {
  timeframe?: string;
}

export const getDashboardOverview = <T = unknown>(params?: DashboardFilters) =>
  apiClient.get<T>("/dashboard/overview", { params });
