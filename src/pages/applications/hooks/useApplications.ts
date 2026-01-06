/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { normalizeArray } from "@/utils/normalize";

export function useApplications(stage: string) {
  return useQuery({
    queryKey: ["applications", stage],
    queryFn: async ({ signal }) => {
      const res = await apiClient.get("/api/applications", { params: { stage }, signal });
      return normalizeArray(res);
    },
  });
}
