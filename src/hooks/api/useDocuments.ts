import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export const useDocuments = () =>
  useQuery({
    queryKey: ['documents'],
    queryFn: async () => (await apiClient.get('/api/documents')).data,
  });
