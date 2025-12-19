import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";

export function useLenders() {
  return useQuery({
    queryKey: ["lenders"],
    queryFn: () => apiFetch("/lenders")
  });
}
