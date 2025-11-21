import { useQuery } from "@tanstack/react-query";
import { get } from "./helpers";

export function useApiQuery<T>(key: any[], url: string, params?: any) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => get<T>(url, params),
  });
}
