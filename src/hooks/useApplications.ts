import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../api/applications";

export function useApplications(params: any = {}) {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => listApplications(params),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createApplication(data),
    onSuccess: () => qc.invalidateQueries(["applications"]),
  });
}

export function useUpdateApplication(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateApplication(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["applications"]);
      qc.invalidateQueries(["application", id]);
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => qc.invalidateQueries(["applications"]),
  });
}
