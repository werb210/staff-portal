import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useNotifications() {
  const qc = useQueryClient();
  const userId = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored)?.id : null;
    } catch {
      return null;
    }
  }, []);

  const list = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const res = await api.get(`/notifications/user/${userId}`);
      return res.data?.data ?? [];
    },
    enabled: Boolean(userId),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  return { list, markRead };
}
