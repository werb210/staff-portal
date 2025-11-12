export type CommunicationChannel = 'sms' | 'email' | 'call';

export interface SMSPayload {
  to: string;
  message: string;
  applicationId?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  applicationId?: string;
}

export interface CallPayload {
  to: string;
  duration?: number;
  outcome?: string;
  applicationId?: string;
  notes?: string;
}

export interface CommunicationMessage {
  id: string;
  sender: 'staff' | 'borrower';
  sentAt: string;
  body: string;
}

export interface CommunicationThread {
  id: string;
  applicationId?: string;
  channel: CommunicationChannel;
  participant: string;
  messages: CommunicationMessage[];
  lastUpdated: string;
}

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
