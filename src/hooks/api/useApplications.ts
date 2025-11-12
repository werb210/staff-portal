import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import type {
  ApplicationCompletionPayload,
  ApplicationPayload,
  DocumentUploadPayload,
} from '../../types/applications';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';
import { useDataStore } from '../../store/dataStore';

export const useApplications = () => {
  const { setApplications } = useDataStore();
  return useQuery({
    queryKey: ['applications'],
    queryFn: applicationService.list,
    onSuccess: (data) => {
      setApplications(data);
    },
  });
};

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();

  return useMutation({
    mutationFn: (payload: ApplicationPayload) => applicationService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
    onError: async (_error, payload) => {
      await storeOffline('/api/applications/create', payload);
      enqueue('/api/applications/create', payload, 'post');
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();

  return useMutation({
    mutationFn: (applicationId: string) => applicationService.submit(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
    onError: (_error, applicationId) => {
      enqueue(`/api/applications/${applicationId}/submit`, {}, 'post');
    },
  });
}

export function useUploadApplicationDocument() {
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: DocumentUploadPayload) => applicationService.uploadDocument(payload),
    onError: async (_error, payload) => {
      await storeOffline('/api/applications/upload', payload);
      enqueue('/api/applications/upload', payload, 'post');
    },
  });
}

export function useCompleteApplication() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: ApplicationCompletionPayload) => applicationService.complete(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
    onError: async (_error, payload) => {
      await storeOffline('/api/applications/complete', payload);
      enqueue('/api/applications/complete', payload, 'post');
    },
  });
}
