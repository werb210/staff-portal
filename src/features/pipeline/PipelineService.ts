import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import {
  getApplicationDetails,
  getApplicationsByStage,
  getPipelineStages,
  moveApplication,
} from "@/lib/api";
import { PipelineCard, PipelineStage } from "./PipelineTypes";

export function usePipelineStages() {
  const { addToast } = useToast();

  return useQuery<PipelineStage[], Error>({
    queryKey: ["pipeline-stages"],
    queryFn: getPipelineStages,
    staleTime: 5 * 60 * 1000,
    onError: (error) =>
      addToast({
        title: "Unable to load stages",
        description: error.message,
        variant: "destructive",
      }),
  });
}

export function useStageApplications(stageId?: string) {
  const { addToast } = useToast();

  return useQuery<PipelineCard[], Error>({
    queryKey: ["stage-applications", stageId],
    queryFn: () => getApplicationsByStage(stageId ?? ""),
    enabled: Boolean(stageId),
    refetchInterval: 10000,
    onError: (error) =>
      addToast({
        title: "Unable to load applications",
        description: error.message,
        variant: "destructive",
      }),
  });
}

export function useMoveApplication() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ appId, stageId }: { appId: string; stageId: string }) =>
      moveApplication(appId, stageId),
    onSuccess: () => {
      addToast({ title: "Move saved", description: "Pipeline updated", variant: "success" });
    },
    onError: (error: Error) => {
      addToast({ title: "Failed to move", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stage-applications"] });
    },
  });
}

export const fetchApplicationDetails = getApplicationDetails;
