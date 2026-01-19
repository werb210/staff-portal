import { apiClient } from "@/api/httpClient";
import type { PipelineApplication, PipelineFilters, PipelineStageId } from "./pipeline.types";

const buildQueryParams = (filters: PipelineFilters): string => {
  const params = new URLSearchParams();
  if (filters.searchTerm) params.set("search", filters.searchTerm);
  if (filters.productCategory) params.set("productCategory", filters.productCategory);
  if (filters.assignedStaffId) params.set("assignedStaff", filters.assignedStaffId);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  if (filters.docsStatus && filters.docsStatus !== "all") params.set("docsStatus", filters.docsStatus);
  if (filters.bankingComplete != null) params.set("bankingComplete", String(filters.bankingComplete));
  if (filters.ocrComplete != null) params.set("ocrComplete", String(filters.ocrComplete));
  if (filters.sort) params.set("sort", filters.sort);
  return params.toString();
};

export const pipelineApi = {
  fetchColumn: async (stage: PipelineStageId, filters: PipelineFilters, options?: { signal?: AbortSignal }) => {
    const query = buildQueryParams(filters);
    const path = query ? `/portal/applications?${query}` : "/portal/applications";
    const res = await apiClient.getList<PipelineApplication>(path, options);
    return res.items.filter((application) => application.stage === stage);
  },
  moveCard: async (applicationId: string, newStage: PipelineStageId) => {
    return apiClient.patch<PipelineApplication>(`/applications/${applicationId}/status`, { stage: newStage });
  },
  fetchSummary: async (applicationId: string) => {
    return apiClient.get<PipelineApplication>(`/applications/${applicationId}/summary`);
  }
};

export type PipelineApi = typeof pipelineApi;
