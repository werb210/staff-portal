export type ChatRole = "client" | "staff" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: number;
}
