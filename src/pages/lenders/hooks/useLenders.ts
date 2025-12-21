/* =========================================================
   FILE: src/pages/lenders/hooks/useLenders.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";
import { normalizeArray } from "@/utils/normalize";

export function useLenders() {
  return useQuery({
    queryKey: ["lenders"],
    queryFn: async () => {
      const res = await apiFetch("/lenders");
      return normalizeArray(res);
    },
  });
}
