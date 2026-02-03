import type { Contact } from "./crm";

export type CommunicationType = "chat" | "human" | "issue" | "sms" | "system";
export type CommunicationDirection = "in" | "out";

export type CommunicationMessage = {
  id: string;
  conversationId: string;
  direction: CommunicationDirection;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  type: CommunicationType;
  silo: string;
};

export type SmsMessage = CommunicationMessage;

export type CommunicationConversation = {
  id: string;
  applicationId?: string;
  contactId?: string;
  contactName?: string;
  applicationName?: string;
  type: CommunicationType;
  direction?: CommunicationDirection;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  silo: string;
  assignedTo?: string;
  unread?: number;
  messages: CommunicationMessage[];
  highlighted?: boolean;
  acknowledged?: boolean;
};

export type TimelineEntry = {
  id: string;
  contactId?: string;
  applicationId?: string;
  conversationId: string;
  message: string;
  createdAt: string;
};

const crmTimeline: TimelineEntry[] = [];
const applicationTimeline: TimelineEntry[] = [];

const staffRotation = ["Alex", "Brooke", "Casey", "Devon"];
let rotationIndex = 0;

const now = () => new Date().toISOString();

const baseConversations: CommunicationConversation[] = [
  {
    id: "conv-chat-1",
    contactId: "contact-1",
    contactName: "Jane Client",
    applicationId: "app-1001",
    applicationName: "BF Application 1001",
    type: "chat",
    createdAt: now(),
    updatedAt: now(),
    silo: "BF",
    assignedTo: "Alex",
    unread: 1,
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-chat-1",
        direction: "in",
        message: "Hi, I have a question about my status",
        createdAt: now(),
        type: "chat",
        silo: "BF"
      },
      {
        id: "msg-2",
        conversationId: "conv-chat-1",
        direction: "out",
        message: "Happy to help!",
        createdAt: now(),
        type: "chat",
        silo: "BF"
      }
    ]
  },
  {
    id: "conv-sms-1",
    contactId: "contact-2",
    contactName: "Jordan SMS",
    applicationId: "app-2002",
    applicationName: "BI Application 2002",
    type: "sms",
    createdAt: now(),
    updatedAt: now(),
    silo: "BI",
    assignedTo: "Brooke",
    unread: 0,
    messages: [
      {
        id: "msg-3",
        conversationId: "conv-sms-1",
        direction: "in",
        message: "New documents submitted",
        createdAt: now(),
        type: "sms",
        silo: "BI"
      }
    ]
  },
  {
    id: "conv-human-1",
    contactId: "contact-3",
    contactName: "Taylor Escalation",
    applicationId: "app-3003",
    applicationName: "SLF Application 3003",
    type: "human",
    createdAt: now(),
    updatedAt: now(),
    silo: "SLF",
    assignedTo: "Casey",
    highlighted: true,
    unread: 2,
    messages: [
      {
        id: "msg-4",
        conversationId: "conv-human-1",
        direction: "in",
        message: "Client requested human assistance via AI chat.",
        createdAt: now(),
        type: "human",
        silo: "SLF"
      }
    ]
  },
  {
    id: "conv-issue-1",
    contactId: "contact-4",
    contactName: "Jamie Issue",
    applicationId: "app-4004",
    applicationName: "BF Application 4004",
    type: "issue",
    createdAt: now(),
    updatedAt: now(),
    silo: "BF",
    assignedTo: "Devon",
    highlighted: true,
    acknowledged: false,
    unread: 1,
    messages: [
      {
        id: "msg-5",
        conversationId: "conv-issue-1",
        direction: "in",
        message: "Report: Upload button fails",
        createdAt: now(),
        type: "issue",
        silo: "BF"
      }
    ]
  }
];

let conversations = baseConversations.map((conv) => ({ ...conv }));

const clone = <T,>(data: T): T => structuredClone(data);

const logTimeline = (conversation: CommunicationConversation, message: string) => {
  const entry: TimelineEntry = {
    id: `timeline-${Date.now()}`,
    conversationId: conversation.id,
    contactId: conversation.contactId,
    applicationId: conversation.applicationId,
    message,
    createdAt: now()
  };

  if (conversation.contactId) {
    crmTimeline.push(entry);
  }
  if (conversation.applicationId) {
    applicationTimeline.push(entry);
  }

  return entry;
};

export const logApplicationCallEvent = async (payload: {
  applicationId: string;
  number: string;
  durationSeconds: number;
  outcome: string;
  failureReason?: string | null;
}) => {
  const entry: TimelineEntry = {
    id: `call-${Date.now()}`,
    conversationId: payload.applicationId,
    applicationId: payload.applicationId,
    message: `Call to ${payload.number} · Duration ${payload.durationSeconds}s · Outcome ${payload.outcome}${
      payload.failureReason ? ` · Reason ${payload.failureReason}` : ""
    }`,
    createdAt: now()
  };
  applicationTimeline.push(entry);
  return Promise.resolve(clone(entry));
};

const findConversation = (conversationId: string) => conversations.find((conv) => conv.id === conversationId);

const updateConversation = (conversation: CommunicationConversation) => {
  conversations = conversations.map((existing) => (existing.id === conversation.id ? conversation : existing));
  return conversation;
};

export const fetchCommunicationThreads = async () => Promise.resolve(clone(conversations));

export const fetchConversationById = async (conversationId: string) => {
  const conversation = findConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  return clone(conversation);
};

export const sendCommunication = async (
  conversationId: string,
  body: string,
  channel?: CommunicationType,
  siloNumber?: string
) => {
  const conversation = findConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const message: CommunicationMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    direction: "out",
    message: channel === "sms" && siloNumber ? `${body} (from ${siloNumber})` : body,
    createdAt: now(),
    type: channel ?? conversation.type,
    silo: conversation.silo
  };

  const updated: CommunicationConversation = {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: message.createdAt,
    unread: 0
  };

  updateConversation(updated);
  logTimeline(updated, `Staff replied via ${message.type}: ${body}`);
  return clone(message);
};

export const receiveInboundMessage = async (
  conversationId: string,
  body: string,
  type: CommunicationType,
  silo: string
) => {
  const conversation = findConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  const message: CommunicationMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    direction: "in",
    message: body,
    createdAt: now(),
    type,
    silo
  };
  const updated: CommunicationConversation = {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: message.createdAt,
    unread: (conversation.unread ?? 0) + 1
  };
  updateConversation(updated);
  logTimeline(updated, `Inbound ${type} message received: ${body}`);
  return clone(message);
};

export const createHumanEscalation = async (payload: {
  contactId?: string;
  contactName?: string;
  applicationId?: string;
  applicationName?: string;
  silo: string;
  message: string;
}) => {
  const assignedTo = staffRotation[rotationIndex % staffRotation.length];
  rotationIndex += 1;
  const conversation: CommunicationConversation = {
    id: `human-${Date.now()}`,
    contactId: payload.contactId,
    contactName: payload.contactName,
    applicationId: payload.applicationId,
    applicationName: payload.applicationName,
    type: "human",
    createdAt: now(),
    updatedAt: now(),
    silo: payload.silo,
    assignedTo,
    highlighted: true,
    unread: 1,
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversationId: `human-${Date.now()}`,
        direction: "in",
        message: payload.message,
        createdAt: now(),
        type: "human",
        silo: payload.silo
      }
    ]
  };
  conversations = [conversation, ...conversations];
  logTimeline(conversation, "Client requested human assistance via AI chat.");
  return clone(conversation);
};

export const createIssueReport = async (payload: {
  contactId?: string;
  contactName?: string;
  applicationId?: string;
  applicationName?: string;
  silo: string;
  message: string;
}) => {
  const conversation: CommunicationConversation = {
    id: `issue-${Date.now()}`,
    contactId: payload.contactId,
    contactName: payload.contactName,
    applicationId: payload.applicationId,
    applicationName: payload.applicationName,
    type: "issue",
    createdAt: now(),
    updatedAt: now(),
    silo: payload.silo,
    assignedTo: "Unassigned",
    highlighted: true,
    acknowledged: false,
    unread: 1,
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversationId: `issue-${Date.now()}`,
        direction: "in",
        message: payload.message,
        createdAt: now(),
        type: "issue",
        silo: payload.silo
      }
    ]
  };
  conversations = [conversation, ...conversations];
  logTimeline(conversation, "Issue reported via AI workflow.");
  return clone(conversation);
};

export const acknowledgeIssue = async (conversationId: string) => {
  const conversation = findConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  const updated = { ...conversation, acknowledged: true, highlighted: false, unread: 0 };
  updateConversation(updated);
  logTimeline(updated, "Issue acknowledged by staff.");
  return clone(updated);
};

export const fetchSmsThread = async (contactId: string) => {
  const thread = conversations.find((conv) => conv.contactId === contactId && conv.type === "sms");
  return Promise.resolve(thread ? clone(thread.messages) : []);
};

export const sendSms = async (contact: Contact, body: string, siloNumber: string) => {
  let conversation = conversations.find((conv) => conv.contactId === contact.id && conv.type === "sms");
  if (!conversation) {
    const applicationId = contact.applicationIds[0];
    conversation = {
      id: `sms-${Date.now()}`,
      contactId: contact.id,
      contactName: contact.name,
      applicationId,
      applicationName: applicationId ? `Application ${applicationId}` : undefined,
      type: "sms",
      createdAt: now(),
      updatedAt: now(),
      silo: contact.silo ?? "BF",
      messages: [],
      unread: 0
    };
    conversations = [conversation, ...conversations];
  }
  const message = await sendCommunication(conversation.id, body, "sms", siloNumber);
  return message;
};

export const logCall = async (contactId: string, summary: string) =>
  new Promise((resolve) => setTimeout(() => resolve({ contactId, summary }), 10));

export const getCrmTimelineEntries = (contactId: string) => crmTimeline.filter((entry) => entry.contactId === contactId);

export const getApplicationTimelineEntries = (applicationId: string) =>
  applicationTimeline.filter((entry) => entry.applicationId === applicationId);

export const resetCommunicationsFixtures = () => {
  conversations = baseConversations.map((conv) => ({ ...conv, messages: [...conv.messages] }));
  crmTimeline.length = 0;
  applicationTimeline.length = 0;
  rotationIndex = 0;
};
