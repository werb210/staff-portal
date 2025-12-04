// src/hooks/useContacts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContactsAPI } from "../api/contacts";

export function useContacts() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await ContactsAPI.list();
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await ContactsAPI.create(payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });

  return { list, create };
}
