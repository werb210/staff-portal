import type { Contact } from "./crm";

export type SmsMessage = {
  id: string;
  contactId: string;
  direction: "inbound" | "outbound";
  body: string;
  timestamp: string;
};

const smsThreads: SmsMessage[] = [
  {
    id: "sms-1",
    contactId: "c1",
    direction: "inbound",
    body: "Hello from Jane",
    timestamp: new Date().toISOString()
  },
  {
    id: "sms-2",
    contactId: "c1",
    direction: "outbound",
    body: "Thanks Jane!",
    timestamp: new Date().toISOString()
  }
];

export const fetchSmsThread = async (contactId: string) =>
  new Promise<SmsMessage[]>((resolve) =>
    setTimeout(() => resolve(smsThreads.filter((msg) => msg.contactId === contactId)), 10)
  );

export const sendSms = async (contact: Contact, body: string, siloNumber: string) => {
  const message: SmsMessage = {
    id: `sms-${Date.now()}`,
    contactId: contact.id,
    direction: "outbound",
    body: `${body} (from ${siloNumber})`,
    timestamp: new Date().toISOString()
  };
  smsThreads.push(message);
  return new Promise<SmsMessage>((resolve) => setTimeout(() => resolve(message), 10));
};

export const requestVoiceToken = async () =>
  new Promise<string>((resolve) => setTimeout(() => resolve("mock-twilio-token"), 10));

export const logCall = async (contactId: string, summary: string) =>
  new Promise((resolve) => setTimeout(() => resolve({ contactId, summary }), 10));
