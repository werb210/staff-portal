import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lenderService } from '../../services/lenderService';
import type { SendToLenderPayload } from '../../types/lenders';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';
import { useDataStore } from '../../store/dataStore';

export const useLenders = () => {
  const { setLenders } = useDataStore();
  return useQuery({
    queryKey: ['lenders'],
    queryFn: lenderService.list,
    onSuccess: (data) => {
      setLenders(data);
    },
  });
};

export const useLenderProducts = () => {
  const { setLenderProducts } = useDataStore();
  return useQuery({
    queryKey: ['lender-products'],
    queryFn: lenderService.products,
    onSuccess: (data) => {
      setLenderProducts(data);
    },
  });
};

export function useSendToLender() {
  const queryClient = useQueryClient();
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: SendToLenderPayload) => lenderService.sendToLender(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lenders'] });
      void queryClient.invalidateQueries({ queryKey: ['lender-products'] });
    },
    onError: async (_error, payload) => {
      await storeOffline('/api/lenders/send-to-lender', payload);
      enqueue('/api/lenders/send-to-lender', payload, 'post');
    },
  });
}
