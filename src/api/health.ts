import { apiClient } from './config';
import type { HealthStatus } from '../utils/types';

export async function getHealthStatus(): Promise<HealthStatus> {
  const { data } = await apiClient.get<HealthStatus>('/_int/health');
  return data;
}
