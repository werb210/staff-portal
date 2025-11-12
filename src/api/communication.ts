import { apiClient } from './config';
import type { EmailPayload, SmsLog } from '../utils/types';

export async function sendSMS(to: string, body: string): Promise<{ success: boolean }>
{
  const { data } = await apiClient.post<{ success: boolean }>('/communication/sms', { to, body });
  return data;
}

export async function getSMSLogs(): Promise<SmsLog[]> {
  const { data } = await apiClient.get<SmsLog[]>('/communication/sms');
  return data;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  const { data } = await apiClient.post<{ success: boolean }>('/communication/email', payload);
  return data;
}
