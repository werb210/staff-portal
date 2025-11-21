import apiClient from "../api";

export interface DashboardFilters {
  timeframe?: string;
}

export const getDashboardOverview = <T = unknown>(params?: DashboardFilters) =>
  apiClient.get<T>("/dashboard/overview", { params });
