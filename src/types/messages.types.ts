export type MessageSource = "client" | "staff" | "ai_escalation" | "system" | string;

export type MessageRecord = {
  id: string;
  body: string;
  senderId?: string | null;
  senderName?: string | null;
  senderType?: "client" | "staff" | "system" | string | null;
  source?: MessageSource | null;
  createdAt: string;
  readAt?: string | null;
  status?: "read" | "unread" | "delivered" | "queued" | string | null;
};
