// src/hooks/useContacts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useContacts() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await api.get("/contacts");
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/contacts", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries(["contacts"]),
  });

  return { list, create };
}
