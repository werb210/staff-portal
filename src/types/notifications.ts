export type NotificationChannel = 'email' | 'sms' | 'push';

export interface NotificationRecord {
  id: string;
  message: string;
  channel: NotificationChannel;
  createdAt: string;
  readAt?: string;
  silo: 'BF' | 'SLF' | 'BI';
  recipient?: string;
}

export interface NotificationDispatchPayload {
  channel: NotificationChannel;
  message: string;
  recipient?: string;
  applicationId?: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}
