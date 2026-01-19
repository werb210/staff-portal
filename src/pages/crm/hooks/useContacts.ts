/* =========================================================
   FILE: src/pages/crm/hooks/useContacts.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/http";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: ({ signal }) => apiClient.get("/crm/contacts", { signal }),
  });
}
