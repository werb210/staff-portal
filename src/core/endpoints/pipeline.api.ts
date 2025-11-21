import apiClient from "../api";

export interface PipelineFilters {
  timeframe?: string;
  stage?: string;
  page?: number;
  perPage?: number;
}

export const getPipelineSummary = <T = unknown>(params?: PipelineFilters) =>
  apiClient.get<T>("/pipeline/summary", { params });

export const listPipelineItems = <T = unknown>(params?: PipelineFilters) =>
  apiClient.get<T>("/pipeline/items", { params });
