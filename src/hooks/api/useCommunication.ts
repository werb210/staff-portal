import { useMutation } from '@tanstack/react-query';
import { communicationService } from '../../services/communicationService';
import type { CallPayload, EmailPayload, SMSPayload } from '../../types/communication';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';
import { useDataStore } from '../../store/dataStore';

export function useSendSMS() {
  const { enqueue } = useOfflineQueue();
  const { addCommunicationThread } = useDataStore();
  return useMutation({
    mutationFn: (payload: SMSPayload) => communicationService.sendSMS(payload),
    onSuccess: (_data, payload) => {
      addCommunicationThread({
        id: `sms-${Date.now()}`,
        channel: 'sms',
        participant: payload.to,
        applicationId: payload.applicationId,
        lastUpdated: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'staff',
            body: payload.message,
            sentAt: new Date().toISOString(),
          },
        ],
      });
    },
    onError: async (_error, payload) => {
      await storeOffline('/api/communication/sms', payload);
      enqueue('/api/communication/sms', payload, 'post');
    },
  });
}

export function useSendEmail() {
  const { enqueue } = useOfflineQueue();
  const { addCommunicationThread } = useDataStore();
  return useMutation({
    mutationFn: (payload: EmailPayload) => communicationService.sendEmail(payload),
    onSuccess: (_data, payload) => {
      addCommunicationThread({
        id: `email-${Date.now()}`,
        channel: 'email',
        participant: payload.to,
        applicationId: payload.applicationId,
        lastUpdated: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'staff',
            body: payload.body,
            sentAt: new Date().toISOString(),
          },
        ],
      });
    },
    onError: async (_error, payload) => {
      await storeOffline('/api/communication/email', payload);
      enqueue('/api/communication/email', payload, 'post');
    },
  });
}

export function useLogCall() {
  const { enqueue } = useOfflineQueue();
  const { addCommunicationThread } = useDataStore();
  return useMutation({
    mutationFn: (payload: CallPayload) => communicationService.logCall(payload),
    onSuccess: (_data, payload) => {
      addCommunicationThread({
        id: `call-${Date.now()}`,
        channel: 'call',
        participant: payload.to,
        applicationId: payload.applicationId,
        lastUpdated: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'staff',
            body: payload.notes ?? 'Call logged',
            sentAt: new Date().toISOString(),
          },
        ],
      });
    },
    onError: async (_error, payload) => {
      await storeOffline('/api/communication/calls', payload);
      enqueue('/api/communication/calls', payload, 'post');
    },
  });
}
