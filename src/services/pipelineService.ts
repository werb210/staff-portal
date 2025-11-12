import apiClient from '../hooks/api/axiosClient';
import type { PipelineReorderPayload, PipelineStage, PipelineTransitionPayload } from '../types/pipeline';

export const pipelineService = {
  list: async () => (await apiClient.get<PipelineStage[]>('/api/pipeline')).data,
  transition: async (payload: PipelineTransitionPayload) =>
    (await apiClient.post('/api/pipeline/transition', payload)).data,
  reorder: async (payload: PipelineReorderPayload) =>
    (await apiClient.post('/api/pipeline/reorder', payload)).data,
};
