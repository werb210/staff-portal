import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLenderProduct,
  getLenderProduct,
  getLenderProducts,
  updateLenderProduct,
  type LenderProduct,
  type LenderProductInput,
} from '../api/lenders';

const LENDERS_KEY = ['lender-products'];

export const useLenderProducts = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: LENDERS_KEY,
    queryFn: getLenderProducts,
  });

  const productQuery = (id: string) =>
    useQuery({
      queryKey: [...LENDERS_KEY, id],
      queryFn: () => getLenderProduct(id),
      enabled: Boolean(id),
    });

  const createMutation = useMutation({
    mutationFn: createLenderProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LENDERS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: LenderProductInput }) => updateLenderProduct(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: LENDERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...LENDERS_KEY, variables.id] });
    },
  });

  return { listQuery, productQuery, createMutation, updateMutation };
};

export type { LenderProduct };
