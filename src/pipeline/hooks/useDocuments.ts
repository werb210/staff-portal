// src/pipeline/hooks/useDocuments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../api/documentsApi";

export const useDocuments = (applicationId: string) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["documents", applicationId],
    queryFn: () => documentsApi.list(applicationId),
    enabled: !!applicationId,
  });

  const upload = useMutation({
    mutationFn: ({
      file,
      category,
    }: {
      file: File;
      category: string;
    }) => documentsApi.upload(applicationId, file, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", applicationId] });
    },
  });

  const accept = useMutation({
    mutationFn: (documentId: string) => documentsApi.accept(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", applicationId] });
    },
  });

  const reject = useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason: string;
    }) => documentsApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", applicationId] });
    },
  });

  const downloadUrl = useMutation({
    mutationFn: (documentId: string) =>
      documentsApi.downloadUrl(documentId),
  });

  return {
    query,
    upload,
    accept,
    reject,
    downloadUrl,
  };
};
