/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { pipelineApi } from "@/pages/applications/pipeline/pipeline.api";
import { retryUnlessClientError } from "@/api/retryPolicy";
import type { PipelineApplication } from "@/pages/applications/pipeline/pipeline.types";

export function useApplications(stage: string) {
  return useQuery({
    queryKey: ["applications", stage],
    queryFn: async ({ signal }) => {
      const res = await pipelineApi.fetchColumn(stage, {}, { signal });
      return res.filter((application) => application.stage === stage);
    },
    retry: retryUnlessClientError,
    placeholderData: (previousData) => previousData ?? [],
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });
}
