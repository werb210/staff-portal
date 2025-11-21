import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { PipelineCard } from "@/features/pipeline/PipelineTypes";
import { api } from "@/lib/api";

function toError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return new Error(message ?? error.message);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

export const fetchPipelineApplications = async (stageId: string) => {
  try {
    const response = await api.get<PipelineCard[]>("/pipeline/applications", { params: { stageId } });
    return response.data ?? [];
  } catch (error) {
    throw toError(error, "Failed to load applications");
  }
};

export function usePipelineApplications(stageId?: string) {
  return useQuery<PipelineCard[], Error>({
    queryKey: ["pipeline-applications", stageId],
    queryFn: () => fetchPipelineApplications(stageId ?? ""),
    enabled: Boolean(stageId),
  });
}
