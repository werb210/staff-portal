import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCachedQuery } from './useCachedQuery';
import { acceptDocument, getDocuments, rejectDocument } from '../api/documents';
import type { Document } from '../utils/types';

export function useDocuments() {
  return useCachedQuery<Document[]>(['documents'], getDocuments, 'documents');
}

export function useAcceptDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, reason }: { documentId: string; reason?: string }) =>
      rejectDocument(documentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}

export type { Document };
