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

export function useApplicationDetails(id?: string | null) {
  return useQuery<PipelineCard, Error>({
    queryKey: ["application-details", id],
    queryFn: async () => {
      try {
        const response = await api.get<PipelineCard>(`/applications/${id}`);
        return response.data;
      } catch (error) {
        throw toError(error, "Failed to load application details");
      }
    },
    enabled: Boolean(id),
  });
}
