import { apiClient } from './client';

export interface LenderProduct {
  id: string;
  name: string;
  category: string;
  interestRate: number;
  maxAmount: number;
  description?: string;
  updatedAt: string;
}

export type LenderProductInput = Omit<LenderProduct, 'id' | 'updatedAt'>;

export const getLenderProducts = async (): Promise<LenderProduct[]> => {
  const { data } = await apiClient.get<LenderProduct[]>('/lenders/products');
  return data;
};

export const getLenderProduct = async (id: string): Promise<LenderProduct> => {
  const { data } = await apiClient.get<LenderProduct>(`/lenders/products/${id}`);
  return data;
};

export const createLenderProduct = async (input: LenderProductInput): Promise<LenderProduct> => {
  const { data } = await apiClient.post<LenderProduct>('/lenders/products', input);
  return data;
};

export const updateLenderProduct = async (id: string, input: LenderProductInput): Promise<LenderProduct> => {
  const { data } = await apiClient.put<LenderProduct>(`/lenders/products/${id}`, input);
  return data;
};
