import apiClient from "@/api/client";

export interface DashboardFilters {
  timeframe?: string;
}

export const getDashboardOverview = <T = unknown>(params?: DashboardFilters) =>
  apiClient.get<T>("/dashboard/overview", { params });
