import { useQuery } from "@tanstack/react-query";
import http from "./http";

export function useApiGet<T>(key: string[], url: string, enabled = true) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await http.get(url);
      return data;
    },
    enabled,
    retry: 1,
  });
}
