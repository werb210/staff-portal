/* =========================================================
   FILE: src/pages/applications/hooks/useApplications.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";

export function useApplications(stage: string) {
  return useQuery({
    queryKey: ["applications", stage],
    queryFn: () =>
      apiFetch(`/applications?stage=${encodeURIComponent(stage)}`),
  });
}
