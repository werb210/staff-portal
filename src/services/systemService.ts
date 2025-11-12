import apiClient from '../hooks/api/axiosClient';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
}

export interface BuildGuardStatus {
  locked: boolean;
  reason?: string;
  expiresAt?: string;
}

export const systemService = {
  health: async () => (await apiClient.get<HealthStatus>('/api/_int/health')).data,
  buildGuard: async () => (await apiClient.get<BuildGuardStatus>('/api/_int/build-guard')).data,
};
