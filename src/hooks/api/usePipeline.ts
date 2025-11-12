import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export const usePipeline = () =>
  useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => (await apiClient.get('/api/pipeline')).data,
  });
