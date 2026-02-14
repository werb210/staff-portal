export type AiSessionStatus = "active" | "transferred" | "closed";

export interface AiSession {
  id: string;
  visitorId: string;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  context: "website" | "client";
  status: AiSessionStatus;
  createdAt: string;
}

export interface AiSessionMessage {
  id?: string;
  role: "assistant" | "user" | "staff" | string;
  content: string;
  createdAt?: string;
}
