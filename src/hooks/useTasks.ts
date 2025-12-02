// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useTasks() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/tasks", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const res = await api.put(`/tasks/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/tasks/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { list, create, update, remove };
}
