import { apiClient } from './config';
import type { BackupSnapshot, RetryQueueItem } from '../utils/types';

export async function getRetryQueue(): Promise<RetryQueueItem[]> {
  const { data } = await apiClient.get<RetryQueueItem[]>('/admin/retry-queue');
  return data;
}

export async function getBackups(): Promise<BackupSnapshot[]> {
  const { data } = await apiClient.get<BackupSnapshot[]>('/admin/backups');
  return data;
}
