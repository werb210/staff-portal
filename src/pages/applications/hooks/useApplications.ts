/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { retryUnlessClientError } from "@/api/retryPolicy";
import type { PipelineApplication } from "@/pages/applications/pipeline/pipeline.types";

export function useApplications(stage: string) {
  return useQuery({
    queryKey: ["applications", stage],
    queryFn: async ({ signal }) => {
      const res = await apiClient.getList<PipelineApplication>("/portal/applications", { signal });
      return res.items.filter((application) => application.stage === stage);
    },
    retry: retryUnlessClientError,
    placeholderData: (previousData) => previousData ?? [],
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });
}
