import { useCachedQuery } from './useCachedQuery';
import { getHealthStatus } from '../api/health';
import type { HealthStatus } from '../utils/types';

export function useHealthStatus() {
  return useCachedQuery<HealthStatus>(['health'], getHealthStatus, 'health-status', {
    refetchInterval: 60_000
  });
}

export type { HealthStatus };
