import { useMutation } from '@tanstack/react-query';
import { communicationService } from '../../services/communicationService';
import type { CallPayload, EmailPayload, SMSPayload } from '../../types/communication';
import { useOfflineQueue } from '../offline/useOfflineQueue';
import { storeOffline } from '../../services/pwa/offlineService';

export function useSendSMS() {
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: SMSPayload) => communicationService.sendSMS(payload),
    onError: async (_error, payload) => {
      await storeOffline('/api/communication/sms', payload);
      enqueue('/api/communication/sms', payload, 'post');
    },
  });
}

export function useSendEmail() {
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: EmailPayload) => communicationService.sendEmail(payload),
    onError: async (_error, payload) => {
      await storeOffline('/api/communication/email', payload);
      enqueue('/api/communication/email', payload, 'post');
    },
  });
}

export function useLogCall() {
  const { enqueue } = useOfflineQueue();
  return useMutation({
    mutationFn: (payload: CallPayload) => communicationService.logCall(payload),
    onError: async (_error, payload) => {
      await storeOffline('/api/communication/calls', payload);
      enqueue('/api/communication/calls', payload, 'post');
    },
  });
}
