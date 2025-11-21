import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TagsAPI } from "../../services";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => TagsAPI.list().then(r => r.data),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => TagsAPI.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TagsAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}
