import api from "@/lib/api";
import type { ChatMessage, ChatSession } from "./types";

export const getHumanSessions = async () => {
  const res = await api.get<ChatSession[]>("/chat/sessions", { params: { status: "human" } });
  return res.data;
};

export const getMessages = async (sessionId: string) => {
  const res = await api.get<ChatMessage[]>(`/chat/${sessionId}/messages`);
  return res.data;
};

export const sendStaffMessage = async (sessionId: string, message: string) => {
  const res = await api.post<ChatMessage>("/chat/message", {
    sessionId,
    message,
    role: "staff"
  });
  return res.data;
};

export const closeSession = async (sessionId: string) => {
  const res = await api.post<{ success: boolean }>("/chat/close", {
    sessionId
  });
  return res.data;
};
