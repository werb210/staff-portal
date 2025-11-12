import { useCachedQuery } from './useCachedQuery';
import { getBackups, getRetryQueue } from '../api/admin';
import type { BackupSnapshot, RetryQueueItem } from '../utils/types';

export function useRetryQueue() {
  return useCachedQuery<RetryQueueItem[]>(['admin', 'retryQueue'], getRetryQueue, 'retry-queue');
}

export function useBackups() {
  return useCachedQuery<BackupSnapshot[]>(['admin', 'backups'], getBackups, 'admin-backups');
}

export type { BackupSnapshot, RetryQueueItem };
