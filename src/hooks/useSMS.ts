import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSmsMessages, sendSmsMessage } from '../api/communication';
import type { SmsMessage } from '../types/communication';

const SMS_KEY = ['communication', 'sms'];

export const useSms = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: SMS_KEY,
    queryFn: getSmsMessages,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { to: string; body: string }) => sendSmsMessage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SMS_KEY }),
  });

  return { listQuery, sendMutation };
};

export type { SmsMessage };
