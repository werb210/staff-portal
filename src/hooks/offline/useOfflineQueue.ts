import { useCallback, useEffect } from 'react';
import { usePortalStore } from '../../store/portalStore';
import apiClient from '../api/axiosClient';

export function useOfflineQueue() {
  const { offlineQueue, clearOfflineMutation, queueOfflineMutation, resetQueue } = usePortalStore();

  const sync = useCallback(async () => {
    if (!navigator.onLine) return;
    for (const mutation of [...offlineQueue]) {
      try {
        await apiClient.request({
          url: mutation.endpoint,
          method: mutation.method,
          data: mutation.payload,
        });
        clearOfflineMutation(mutation.id);
      } catch (error) {
        console.error('Failed to sync offline mutation', mutation, error);
        break;
      }
    }
  }, [clearOfflineMutation, offlineQueue]);

  const enqueue = useCallback(
    (endpoint: string, payload: unknown, method: 'post' | 'put' | 'patch') => {
      queueOfflineMutation({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        endpoint,
        payload,
        method,
      });
    },
    [queueOfflineMutation]
  );

  useEffect(() => {
    const onOnline = () => {
      void sync();
    };

    window.addEventListener('online', onOnline);
    void sync();
    return () => {
      window.removeEventListener('online', onOnline);
    };
  }, [sync]);

  const clearQueue = useCallback(() => {
    resetQueue();
  }, [resetQueue]);

  return { offlineQueue, enqueue, sync, clearQueue };
}
