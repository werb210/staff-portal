import type { CallLog, EmailMessage, SmsMessage, Template } from '../types/communication';

export const mockSmsMessages: SmsMessage[] = [
  {
    id: 'sms-1001',
    to: '+1 (555) 010-1001',
    body: 'Hi Jamie! Quick reminder that your underwriting documents are due tomorrow.',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'sms-1002',
    to: '+1 (555) 010-2044',
    body: 'Thanks for the update — we received your banking statements.',
    status: 'delivered',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export const mockCallLogs: CallLog[] = [
  {
    id: 'call-9001',
    contact: 'Northwind Outfitters',
    duration: 420,
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'call-9002',
    contact: 'Summit Solar Co',
    duration: 185,
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

export const mockEmails: EmailMessage[] = [
  {
    id: 'email-3001',
    subject: 'Updated term sheet attached',
    to: 'alex.morgan@northwind.example',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'email-3002',
    subject: 'Pipeline status overview',
    to: 'jamie.chen@summitsolar.example',
    status: 'queued',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

export const mockTemplates: Template[] = [
  {
    id: 'template-5001',
    name: 'Underwriting checklist',
    subject: 'Documents needed for underwriting',
    body: 'Hi {{name}}, please send the following documents to keep things moving...',
    type: 'email',
  },
  {
    id: 'template-5002',
    name: 'Follow-up SMS',
    body: 'Hi {{firstName}}, checking in on your application. Let me know when you have a minute to chat.',
    type: 'sms',
  },
];
