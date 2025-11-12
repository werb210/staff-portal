import apiClient from '../hooks/api/axiosClient';
import type { NotificationDispatchPayload, NotificationRecord, PushSubscriptionPayload } from '../types/notifications';

export const notificationService = {
  list: async () => (await apiClient.get<NotificationRecord[]>('/api/notifications')).data,
  dispatch: async (payload: NotificationDispatchPayload) =>
    (await apiClient.post('/api/notifications/dispatch', payload)).data,
  markRead: async (notificationId: string) =>
    (await apiClient.post(`/api/notifications/${notificationId}/read`, {})).data,
  subscribePush: async (payload: PushSubscriptionPayload) =>
    (await apiClient.post('/api/notifications/push/subscribe', payload)).data,
  notifyStageChange: async (payload: {
    applicationId: string;
    stage: string;
    borrowerEmail?: string;
    borrowerPhone?: string;
  }) => {
    const operations: Promise<unknown>[] = [];
    if (payload.borrowerEmail) {
      operations.push(
        apiClient.post('/api/notifications/dispatch', {
          channel: 'email',
          message: `Application ${payload.applicationId} is now ${payload.stage}.`,
          recipient: payload.borrowerEmail,
          applicationId: payload.applicationId,
        })
      );
    }
    if (payload.borrowerPhone) {
      operations.push(
        apiClient.post('/api/notifications/dispatch', {
          channel: 'sms',
          message: `Your application ${payload.applicationId} moved to ${payload.stage}.`,
          recipient: payload.borrowerPhone,
          applicationId: payload.applicationId,
        })
      );
    }
    await Promise.all(operations);
  },
};
