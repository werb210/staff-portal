import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { PipelineStage } from "@/features/pipeline/PipelineTypes";
import { api } from "@/lib/api";

function toError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return new Error(message ?? error.message);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

export function usePipelineStages() {
  return useQuery<PipelineStage[], Error>({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      try {
        const response = await api.get<PipelineStage[]>("/pipeline/stages");
        const stages = response.data ?? [];
        return [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      } catch (error) {
        throw toError(error, "Failed to load pipeline stages");
      }
    },
  });
}
