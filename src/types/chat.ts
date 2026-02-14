export type ChatSessionStatus = "ai_active" | "transferred_to_staff" | "closed";

export type ChatTranscriptMessage = {
  role: string;
  content: string;
};

export interface ChatSession {
  id: string;
  leadId: string;
  status: ChatSessionStatus;
  transcript: ChatTranscriptMessage[];
  createdAt: string;
}
