import { useQuery } from '@tanstack/react-query';
import apiClient from './axiosClient';

export interface CRMEntity {
  id: string;
  name: string;
  email?: string;
}

export const useCRMEntities = () =>
  useQuery<CRMEntity[]>({
    queryKey: ['crm-entities'],
    queryFn: async () => (await apiClient.get('/api/crm/entities')).data,
  });
