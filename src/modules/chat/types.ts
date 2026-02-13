export interface ChatSession {
  id: string;
  source: string;
  status: "ai" | "human" | "closed";
  lead_id?: string | null;
  channel?: string | null;
  lead_name?: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "ai" | "staff";
  message: string;
  created_at: string;
}
