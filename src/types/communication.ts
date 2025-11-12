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

export type CommunicationChannel = 'sms' | 'email' | 'call';

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
