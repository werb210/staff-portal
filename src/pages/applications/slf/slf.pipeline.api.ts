import { apiClient } from "@/api/client";
import type { SLFPipelineApplication, SLFStageId } from "./slf.pipeline.types";

export const slfPipelineApi = {
  fetchColumn: async (stage: SLFStageId, options?: { signal?: AbortSignal }) => {
    const res = await apiClient.getList<SLFPipelineApplication>(`/api/slf/applications?stage=${stage}`, options);
    return res.items;
  },
  moveCard: async (applicationId: string, newStage: SLFStageId) => {
    return apiClient.patch<SLFPipelineApplication>(`/api/slf/applications/${applicationId}/status`, { status: newStage });
  },
  fetchSummary: async (applicationId: string) => {
    return apiClient.get<SLFPipelineApplication>(`/api/slf/applications/${applicationId}/summary`);
  }
};

export type SLFPipelineApi = typeof slfPipelineApi;
