import { useQuery } from "@tanstack/react-query";
import { fetchPipeline, PipelineResponse } from "@/lib/api/pipeline";

export function usePipeline() {
  return useQuery<PipelineResponse>({
    queryKey: ["pipeline"],
    queryFn: fetchPipeline,
    refetchInterval: 5000
  });
}
