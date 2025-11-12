import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCachedQuery } from './useCachedQuery';
import { getPipeline, updateStage } from '../api/pipeline';
import type { PipelineStage } from '../utils/types';

export function usePipeline() {
  return useCachedQuery<PipelineStage[]>(['pipeline'], getPipeline, 'pipeline');
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, stageId }: { applicationId: string; stageId: string }) =>
      updateStage(applicationId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
}

export type { PipelineStage };
