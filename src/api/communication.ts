import { mockCallLogs, mockEmails, mockSmsMessages, mockTemplates } from '../mock';
import type { CallLog, EmailMessage, SmsMessage, Template } from '../types/communication';

let smsMessages = [...mockSmsMessages];
let callLogs = [...mockCallLogs];
let emails = [...mockEmails];
let templates = [...mockTemplates];

const nowIso = () => new Date().toISOString();

export const getSmsMessages = async (): Promise<SmsMessage[]> => smsMessages;

export const sendSmsMessage = async (payload: { to: string; body: string }) => {
  const message: SmsMessage = {
    id: `sms-${Date.now()}`,
    to: payload.to,
    body: payload.body,
    status: 'sent',
    sentAt: nowIso(),
  };
  smsMessages = [message, ...smsMessages];
  return message;
};

export const getCallLogs = async (): Promise<CallLog[]> => callLogs;

export const logCall = async (payload: { contact: string; notes?: string }) => {
  const log: CallLog = {
    id: `call-${Date.now()}`,
    contact: payload.contact,
    duration: Math.floor(Math.random() * 600),
    status: 'completed',
    startedAt: nowIso(),
  };
  callLogs = [log, ...callLogs];
  return log;
};

export const getEmails = async (): Promise<EmailMessage[]> => emails;

export const sendEmail = async (payload: { to: string; subject: string; body: string }) => {
  const email: EmailMessage = {
    id: `email-${Date.now()}`,
    subject: payload.subject,
    to: payload.to,
    status: 'sent',
    sentAt: nowIso(),
  };
  emails = [email, ...emails];
  return email;
};

export const getTemplates = async (): Promise<Template[]> => templates;

export const saveTemplate = async (payload: Template) => {
  const existingIndex = templates.findIndex((template) => template.id === payload.id);
  if (existingIndex === -1) {
    templates = [{ ...payload, id: payload.id || `template-${Date.now()}` }, ...templates];
    return templates[0];
  }

  templates[existingIndex] = { ...templates[existingIndex], ...payload };
  return templates[existingIndex];
};
