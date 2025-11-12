import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export const useLenders = () =>
  useQuery({
    queryKey: ['lenders'],
    queryFn: async () => (await apiClient.get('/api/lenders')).data,
  });
