import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { documentService } from '../../services/documentService';
import type { DocumentRecord, DocumentStatusPayload } from '../../types/documents';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';
import { useDataStore } from '../../store/dataStore';

export const useDocuments = () => {
  const { setDocuments } = useDataStore();
  const query = useQuery<DocumentRecord[]>({
    queryKey: ['documents'],
    queryFn: documentService.list,
  });
  useEffect(() => {
    if (query.data) {
      setDocuments(query.data);
    }
  }, [query.data, setDocuments]);

  return query;
};

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DocumentStatusPayload }) =>
      documentService.updateStatus(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: async (_error, { id, payload }) => {
      await storeOffline(`/api/documents/${id}/status`, payload);
      enqueue(`/api/documents/${id}/status`, payload, 'post');
    },
  });
}
