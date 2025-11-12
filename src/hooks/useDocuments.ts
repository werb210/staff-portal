import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveDocument,
  getDocuments,
  rejectDocument,
  uploadDocumentVersion,
  type DocumentItem,
} from '../api/documents';

const DOCUMENTS_KEY = ['documents'];

export const useDocuments = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: getDocuments,
  });

  const approveMutation = useMutation({
    mutationFn: approveDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectDocument(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadDocumentVersion(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });

  return { listQuery, approveMutation, rejectMutation, uploadMutation };
};

export type { DocumentItem };
