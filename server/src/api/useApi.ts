import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../lib/api";

export function useApiQuery(key: any[], url: string) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await api.get(url);
      return res.data;
    }
  });
}

export function useApiMutation(method: "post"|"put"|"delete", url: string) {
  return useMutation({
    mutationFn: async (payload?: any) => {
      const res = await api[method](url, payload);
      return res.data;
    }
  });
}
