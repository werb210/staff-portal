import { apiClient } from './config';
import type { Lender, LenderProduct } from '../utils/types';

export async function getLenders(): Promise<Lender[]> {
  const { data } = await apiClient.get<Lender[]>('/lenders');
  return data;
}

export async function sendToLender(applicationId: string, lenderId: string): Promise<{ success: boolean }>
{
  const { data } = await apiClient.post<{ success: boolean }>(`/applications/${applicationId}/lenders`, {
    lenderId
  });
  return data;
}

export async function getProducts(lenderId: string): Promise<LenderProduct[]> {
  const { data } = await apiClient.get<LenderProduct[]>(`/lenders/${lenderId}/products`);
  return data;
}
