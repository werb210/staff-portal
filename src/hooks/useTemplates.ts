import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTemplates, saveTemplate } from '../api/communication';
import type { Template } from '../types/communication';

const TEMPLATE_KEY = ['communication', 'templates'];

export const useTemplates = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: TEMPLATE_KEY,
    queryFn: getTemplates,
  });

  const saveMutation = useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY }),
  });

  return { listQuery, saveMutation };
};

export type { Template };
