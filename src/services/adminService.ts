import apiClient from '../hooks/api/axiosClient';

export interface RetryQueueItem {
  id: string;
  endpoint: string;
  attempts: number;
  lastError?: string;
}

export interface BackupRecord {
  id: string;
  createdAt: string;
  sizeMb: number;
  status: 'pending' | 'complete' | 'failed';
}

export const adminService = {
  retryQueue: async () => (await apiClient.get<RetryQueueItem[]>('/api/admin/retry-queue')).data,
  triggerRetry: async (id: string) => (await apiClient.post(`/api/admin/retry-queue/${id}/retry`)).data,
  backups: async () => (await apiClient.get<BackupRecord[]>('/api/admin/backups')).data,
  createBackup: async () => (await apiClient.post('/api/admin/backups', {})).data,
};
