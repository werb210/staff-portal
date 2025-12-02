// src/hooks/useProducts.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useProducts() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/products", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  return { list, create };
}
