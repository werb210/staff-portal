import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from "../api/documents";

export function useDocuments(applicationId: string) {
  return useQuery({
    queryKey: ["documents", applicationId],
    queryFn: () => listDocuments(applicationId),
    enabled: !!applicationId,
  });
}

export function useUploadDocument(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { file: File; category: string }) =>
      uploadDocument(applicationId, payload.file, payload.category),
    onSuccess: () => qc.invalidateQueries(["documents", applicationId]),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => qc.invalidateQueries(["documents"]),
  });
}
