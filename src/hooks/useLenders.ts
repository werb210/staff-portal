import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCachedQuery } from './useCachedQuery';
import { getLenders, getProducts, sendToLender } from '../api/lenders';
import type { Lender, LenderProduct } from '../utils/types';

export function useLenders() {
  return useCachedQuery<Lender[]>(['lenders'], getLenders, 'lenders');
}

export function useLenderProducts(lenderId: string | undefined) {
  return useCachedQuery<LenderProduct[]>(
    ['lenders', lenderId, 'products'],
    () => getProducts(lenderId ?? ''),
    `lender-products-${lenderId}`,
    {
      enabled: Boolean(lenderId)
    }
  );
}

export function useSendToLender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, lenderId }: { applicationId: string; lenderId: string }) =>
      sendToLender(applicationId, lenderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['lenders'] });
    }
  });
}

export type { Lender, LenderProduct };
