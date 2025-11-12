import { useQueries } from '@tanstack/react-query';
import { systemService } from '../../services/systemService';

export function useSystemStatus() {
  const [health, buildGuard] = useQueries({
    queries: [
      { queryKey: ['system', 'health'], queryFn: systemService.health, staleTime: 1000 * 30 },
      { queryKey: ['system', 'build-guard'], queryFn: systemService.buildGuard, staleTime: 1000 * 30 },
    ],
  });

  return {
    health,
    buildGuard,
    isLoading: health.isLoading || buildGuard.isLoading,
  };
}
