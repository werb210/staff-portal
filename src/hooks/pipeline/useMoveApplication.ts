import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

function toError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return new Error(message ?? error.message);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

export function useMoveApplication() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, stageId }: { id: string; stageId: string }) => {
      try {
        await api.patch(`/pipeline/applications/${id}/move`, { stageId });
      } catch (error) {
        throw toError(error, "Failed to move application");
      }
    },
    onSuccess: () => {
      addToast({ title: "Move saved", description: "Pipeline updated", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["pipeline-applications"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] });
    },
    onError: (error: Error) => {
      addToast({ title: "Failed to move", description: error.message, variant: "destructive" });
    },
  });
}
