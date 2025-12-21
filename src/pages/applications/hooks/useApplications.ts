/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export function useApplications(stage: string) {
  return useQuery({
    queryKey: ["applications", stage],
    queryFn: async () => {
      const res = await apiClient.get("/api/applications", { params: { stage } });

      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.items)) return res.data.items;
      return [];
    },
  });
}
