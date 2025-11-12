import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lenderService } from '../../services/lenderService';
import type { SendToLenderPayload } from '../../types/lenders';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';

export const useLenders = () =>
  useQuery({
    queryKey: ['lenders'],
    queryFn: lenderService.list,
  });

export const useLenderProducts = () =>
  useQuery({
    queryKey: ['lender-products'],
    queryFn: lenderService.products,
  });

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
