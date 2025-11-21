import { useQuery } from "@tanstack/react-query";
import { SearchAPI } from "../../services";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => SearchAPI.query(query).then(r => r.data),
    enabled: !!query && query.length > 2,
  });
}
