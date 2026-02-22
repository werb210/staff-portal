/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { pipelineApi } from "@/pages/applications/pipeline/pipeline.api";
import { retryUnlessClientError } from "@/api/retryPolicy";
import type { PipelineApplication } from "@/pages/applications/pipeline/pipeline.types";
import { useBusinessUnit } from "@/hooks/useBusinessUnit";

export function useApplications(stage: string) {
  const { activeBusinessUnit } = useBusinessUnit();

  return useQuery({
    queryKey: ["applications", activeBusinessUnit, stage],
    queryFn: async ({ signal }) => {
      const res = await pipelineApi.fetchColumn(stage, { businessUnit: activeBusinessUnit }, { signal });
      return res.filter((application) => application.stage === stage);
    },
    retry: retryUnlessClientError,
    placeholderData: (previousData) => previousData ?? [],
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });
}
