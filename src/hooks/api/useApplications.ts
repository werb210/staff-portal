import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export const useApplications = () =>
  useQuery({
    queryKey: ['applications'],
    queryFn: async () => (await apiClient.get('/api/applications')).data,
  });
