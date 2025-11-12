import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/applications');
      return data;
    }
  });
};
