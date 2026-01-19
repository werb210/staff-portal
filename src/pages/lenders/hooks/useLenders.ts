/* =========================================================
   FILE: src/pages/lenders/hooks/useLenders.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/http";

export function useLenders() {
  return useQuery({
    queryKey: ["lenders"],
    queryFn: async ({ signal }) => {
      const data = await apiClient.getList("/lenders", { signal });
      return data.items;
    },
    placeholderData: (previousData) => previousData ?? [],
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });
}
