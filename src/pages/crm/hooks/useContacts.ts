/* =========================================================
   FILE: src/pages/crm/hooks/useContacts.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/httpClient";
import { useBusinessUnit } from "@/hooks/useBusinessUnit";
import { withBusinessUnitQuery } from "@/lib/businessUnit";

export function useContacts() {
  const { activeBusinessUnit } = useBusinessUnit();

  return useQuery({
    queryKey: ["contacts", activeBusinessUnit],
    queryFn: ({ signal }) => apiClient.get(withBusinessUnitQuery("/crm/contacts", activeBusinessUnit), { signal })
  });
}
