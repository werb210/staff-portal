import { apiClient } from "@/api/client";
import type { PipelineApplication, PipelineFilters, PipelineStageId } from "./pipeline.types";

const buildQueryParams = (stage: PipelineStageId, filters: PipelineFilters): string => {
  const params = new URLSearchParams();
  params.set("stage", stage);
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
  fetchColumn: async (stage: PipelineStageId, filters: PipelineFilters) => {
    const query = buildQueryParams(stage, filters);
    const { data } = await apiClient.get<PipelineApplication[]>(`/api/applications?${query}`);
    return data;
  },
  moveCard: async (applicationId: string, newStage: PipelineStageId) => {
    return apiClient.patch<PipelineApplication>(`/api/applications/${applicationId}/status`, { stage: newStage });
  },
  fetchSummary: async (applicationId: string) => {
    return apiClient.get<PipelineApplication>(`/api/applications/${applicationId}/summary`);
  }
};

export type PipelineApi = typeof pipelineApi;
