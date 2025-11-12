import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../../services/pipelineService';
import type { PipelineReorderPayload, PipelineStage, PipelineTransitionPayload } from '../../types/pipeline';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { useDataStore } from '../../store/dataStore';

export const usePipeline = () => {
  const { setPipelineStages } = useDataStore();
  return useQuery<PipelineStage[]>({
    queryKey: ['pipeline'],
    queryFn: pipelineService.list,
    onSuccess: (data) => {
      setPipelineStages(data);
    },
  });
};

export function usePipelineTransition() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: PipelineTransitionPayload) => pipelineService.transition(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (_error, payload) => {
      enqueue('/api/pipeline/transition', payload, 'post');
    },
  });
}

export function usePipelineReorder() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: PipelineReorderPayload) => pipelineService.reorder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
    onError: (_error, payload) => {
      enqueue('/api/pipeline/reorder', payload, 'post');
    },
  });
}
