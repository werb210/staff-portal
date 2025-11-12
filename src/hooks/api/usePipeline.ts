import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export interface PipelineApplication {
  id: string;
  name: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  count?: number;
  applications?: PipelineApplication[];
}

export const usePipeline = () =>
  useQuery<PipelineStage[]>({
    queryKey: ['pipeline'],
    queryFn: async () => (await apiClient.get('/api/pipeline')).data,
  });
