export interface AiSession {
  id: string;
  context: "website" | "client" | "portal";
  escalated: boolean;
  createdAt: string;
}

export interface AiMessage {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
