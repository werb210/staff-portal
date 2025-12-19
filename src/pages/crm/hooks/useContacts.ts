/* =========================================================
   FILE: src/pages/crm/hooks/useContacts.ts
   ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiFetch("/crm/contacts"),
  });
}
