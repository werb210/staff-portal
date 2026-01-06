/* =========================================================
   FILE: src/pages/lenders/hooks/useLenders.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { normalizeArray } from "@/utils/normalize";

export function useLenders() {
  return useQuery({
    queryKey: ["lenders"],
    queryFn: async ({ signal }) => {
      const data = await apiClient.get("/lenders", { signal });
      return normalizeArray(data);
    },
  });
}
