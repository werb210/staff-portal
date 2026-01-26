import { apiClient } from "@/api/httpClient";
import type { PipelineApplication, PipelineFilters, PipelineStage, PipelineStageId } from "./pipeline.types";

const buildQueryParams = (filters: PipelineFilters, stage?: PipelineStageId): string => {
  const params = new URLSearchParams();
  if (stage) params.set("stage", stage);
  if (filters.searchTerm) params.set("search", filters.searchTerm);
  if (filters.productCategory) params.set("productCategory", filters.productCategory);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  if (filters.sort) params.set("sort", filters.sort);
  return params.toString();
};

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((segment) => (segment ? segment[0].toUpperCase() + segment.slice(1) : segment))
    .join(" ");

const parseStage = (item: unknown): PipelineStage | null => {
  if (typeof item === "string") {
    const trimmed = item.trim();
    if (!trimmed) return null;
    return { id: trimmed, label: toTitleCase(trimmed) };
  }
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : typeof record.value === "string" ? record.value : "";
  if (!id) return null;
  const label =
    typeof record.label === "string"
      ? record.label
      : typeof record.name === "string"
        ? record.name
        : toTitleCase(id);
  const description = typeof record.description === "string" ? record.description : undefined;
  const terminal = typeof record.terminal === "boolean" ? record.terminal : undefined;
  const allowedTransitions = Array.isArray(record.allowedTransitions)
    ? record.allowedTransitions.filter((stageId) => typeof stageId === "string") as PipelineStageId[]
    : Array.isArray(record.nextStages)
      ? record.nextStages.filter((stageId) => typeof stageId === "string") as PipelineStageId[]
      : undefined;
  return {
    id,
    label,
    description,
    terminal,
    allowedTransitions
  };
};

export const pipelineApi = {
  fetchStages: async (options?: { signal?: AbortSignal }) => {
    const res = await apiClient.get<unknown>("/portal/applications/stages", options);
    if (!res) return [];
    const rawItems = Array.isArray(res)
      ? res
      : typeof res === "object" && res && Array.isArray((res as { items?: unknown[] }).items)
        ? (res as { items: unknown[] }).items
        : [];
    return rawItems.map(parseStage).filter((stage): stage is PipelineStage => Boolean(stage));
  },
  fetchColumn: async (stage: PipelineStageId, filters: PipelineFilters, options?: { signal?: AbortSignal }) => {
    const query = buildQueryParams(filters, stage);
    const path = query ? `/portal/applications?${query}` : "/portal/applications";
    const res = await apiClient.getList<PipelineApplication>(path, options);
    return res.items;
  },
  moveCard: async (applicationId: string, newStage: PipelineStageId) => {
    return apiClient.patch<PipelineApplication>(`/applications/${applicationId}/status`, { stage: newStage });
  },
  fetchSummary: async (applicationId: string) => {
    return apiClient.get<PipelineApplication>(`/applications/${applicationId}/summary`);
  }
};

export type PipelineApi = typeof pipelineApi;
