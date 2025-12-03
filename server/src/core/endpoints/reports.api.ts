import apiClient from "@/lib/http";

export interface ReportFilters {
  timeframe?: string;
  category?: string;
}

export const getReportsOverview = <T = unknown>(params?: ReportFilters) =>
  apiClient.get<T>("/reports/overview", { params });

export const getReport = <T = unknown>(reportId: string) => apiClient.get<T>(`/reports/${reportId}`);
