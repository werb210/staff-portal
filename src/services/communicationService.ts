import apiClient from '../hooks/api/axiosClient';
import type { CallPayload, EmailPayload, SMSPayload } from '../types/communication';

export const communicationService = {
  sendSMS: async (payload: SMSPayload) => (await apiClient.post('/api/communication/sms', payload)).data,
  sendEmail: async (payload: EmailPayload) => (await apiClient.post('/api/communication/email', payload)).data,
  logCall: async (payload: CallPayload) => (await apiClient.post('/api/communication/calls', payload)).data,
};
