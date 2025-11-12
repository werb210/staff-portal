import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCallLogs, logCall } from '../api/communication';
import type { CallLog } from '../types/communication';

const CALLS_KEY = ['communication', 'calls'];

export const useCalls = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: CALLS_KEY,
    queryFn: getCallLogs,
  });

  const logMutation = useMutation({
    mutationFn: (payload: { contact: string; notes?: string }) => logCall(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CALLS_KEY }),
  });

  return { listQuery, logMutation };
};

export type { CallLog };
