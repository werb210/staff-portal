import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lenderService } from '../../services/lenderService';
import type { Lender, LenderProduct, SendToLenderPayload } from '../../types/lenders';
import { useEffect } from 'react';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';
import { useDataStore } from '../../store/dataStore';

export const useLenders = () => {
  const { setLenders } = useDataStore();
  const query = useQuery<Lender[], Error>({
    queryKey: ['lenders'],
    queryFn: lenderService.list,
  });
  useEffect(() => {
    if (query.data) {
      setLenders(query.data);
    }
  }, [query.data, setLenders]);

  return query;
};

export const useLenderProducts = () => {
  const { setLenderProducts } = useDataStore();
  const query = useQuery<LenderProduct[], Error>({
    queryKey: ['lender-products'],
    queryFn: lenderService.products,
  });
  useEffect(() => {
    if (query.data) {
      setLenderProducts(query.data);
    }
  }, [query.data, setLenderProducts]);

  return query;
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
