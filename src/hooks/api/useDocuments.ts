import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import type { DocumentRecord, DocumentStatusPayload } from '../../types/documents';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';
import { useDataStore } from '../../store/dataStore';

export const useDocuments = () => {
  const { setDocuments } = useDataStore();
  return useQuery<DocumentRecord[]>({
    queryKey: ['documents'],
    queryFn: documentService.list,
    onSuccess: (data) => {
      setDocuments(data);
    },
  });
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
