import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApplicationsAPI } from "../../services";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => ApplicationsAPI.list().then(r => r.data),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => ApplicationsAPI.get(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => ApplicationsAPI.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}
