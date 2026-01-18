/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { retryUnlessClientError } from "@/api/retryPolicy";
import { normalizeArray } from "@/utils/normalize";

export function useApplications(stage: string) {
  return useQuery({
    queryKey: ["applications", stage],
    queryFn: async ({ signal }) => {
      const res = await apiClient.get("/portal/applications", { signal });
      const items = normalizeArray(res);
      return items.filter((application) => application.stage === stage);
    },
    retry: retryUnlessClientError,
  });
}
