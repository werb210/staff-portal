import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export interface DocumentRecord {
  id: string;
  name: string;
  category?: string;
  status?: string;
}

export const useDocuments = () =>
  useQuery<DocumentRecord[]>({
    queryKey: ['documents'],
    queryFn: async () => (await apiClient.get('/api/documents')).data,
  });
