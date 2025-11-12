import { useMutation } from '@tanstack/react-query';
import { useCachedQuery } from './useCachedQuery';
import { getSMSLogs, sendEmail, sendSMS } from '../api/communication';
import type { SmsLog } from '../utils/types';

export function useSMSLogs() {
  return useCachedQuery<SmsLog[]>(['communication', 'sms'], getSMSLogs, 'sms-logs');
}

export function useSendSMS() {
  return useMutation({
    mutationFn: ({ to, body }: { to: string; body: string }) => sendSMS(to, body)
  });
}

export function useSendEmail() {
  return useMutation({
    mutationFn: sendEmail
  });
}

export type { SmsLog };
