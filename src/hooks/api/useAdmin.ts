import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type BackupRecord, type RetryQueueItem } from '../../services/adminService';
import { useOfflineQueue } from '../offline/useOfflineQueue';

export const useRetryQueue = () =>
  useQuery<RetryQueueItem[]>({
    queryKey: ['admin', 'retry-queue'],
    queryFn: adminService.retryQueue,
  });

export const useBackups = () =>
  useQuery<BackupRecord[]>({
    queryKey: ['admin', 'backups'],
    queryFn: adminService.backups,
  });

export function useTriggerRetry() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (id: string) => adminService.triggerRetry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'retry-queue'] });
    },
    onError: (_error, id) => {
      enqueue(`/api/admin/retry-queue/${id}/retry`, {}, 'post');
    },
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: () => adminService.createBackup(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
    },
    onError: () => {
      enqueue('/api/admin/backups', {}, 'post');
    },
  });
}
