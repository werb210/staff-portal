export type ChatRole = "user" | "assistant" | "staff";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  leadId: string;
  status: "ai" | "human" | "closed";
  messages: ChatMessage[];
  createdAt: string;
}
