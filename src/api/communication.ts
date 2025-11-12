import { apiClient } from './client';

export interface SmsMessage {
  id: string;
  to: string;
  body: string;
  status: string;
  sentAt: string;
}

export interface CallLog {
  id: string;
  contact: string;
  duration: number;
  status: string;
  startedAt: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  to: string;
  status: string;
  sentAt: string;
}

export interface Template {
  id: string;
  name: string;
  subject?: string;
  body: string;
  type: 'sms' | 'email';
}

export const getSmsMessages = async (): Promise<SmsMessage[]> => {
  const { data } = await apiClient.get<SmsMessage[]>('/communication/sms');
  return data;
};

export const sendSmsMessage = async (payload: { to: string; body: string }) => {
  const { data } = await apiClient.post<SmsMessage>('/communication/sms', payload);
  return data;
};

export const getCallLogs = async (): Promise<CallLog[]> => {
  const { data } = await apiClient.get<CallLog[]>('/communication/calls');
  return data;
};

export const logCall = async (payload: { contact: string; notes?: string }) => {
  const { data } = await apiClient.post<CallLog>('/communication/calls', payload);
  return data;
};

export const getEmails = async (): Promise<EmailMessage[]> => {
  const { data } = await apiClient.get<EmailMessage[]>('/communication/email');
  return data;
};

export const sendEmail = async (payload: { to: string; subject: string; body: string }) => {
  const { data } = await apiClient.post<EmailMessage>('/communication/email', payload);
  return data;
};

export const getTemplates = async (): Promise<Template[]> => {
  const { data } = await apiClient.get<Template[]>('/communication/templates');
  return data;
};

export const saveTemplate = async (payload: Template) => {
  const { data } = await apiClient.put<Template>(`/communication/templates/${payload.id}`, payload);
  return data;
};
