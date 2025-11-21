import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useApplicationFull(id: string) {
  return useQuery({
    queryKey: ["application-full", id],
    queryFn: async () => {
      const res = await api.get(`/applications/${id}/full`);
      return res.data;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
