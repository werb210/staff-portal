import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/api/notifications')).data,
  });
