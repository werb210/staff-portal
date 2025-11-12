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
