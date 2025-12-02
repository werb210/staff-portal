// src/hooks/useCompanies.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useCompanies() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await api.get("/companies");
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/companies", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });

  return { list, create };
}
