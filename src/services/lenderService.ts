import apiClient from '../hooks/api/axiosClient';
import type { Lender, LenderProduct, SendToLenderPayload } from '../types/lenders';

export const lenderService = {
  list: async () => (await apiClient.get<Lender[]>('/api/lenders')).data,
  products: async () => (await apiClient.get<LenderProduct[]>('/api/lender-products')).data,
  sendToLender: async (payload: SendToLenderPayload) =>
    (await apiClient.post('/api/lenders/send-to-lender', payload)).data,
};
