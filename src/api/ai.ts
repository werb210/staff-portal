import axios from "axios";
import api from "./client";

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

export async function fetchEscalatedSessions() {
  const res = await aiApi.get("/api/ai/escalated");
  return res.data;
}

export async function fetchSessionMessages(sessionId: string) {
  const res = await aiApi.get(`/api/ai/session/${sessionId}`);
  return res.data;
}

export async function sendStaffMessage(sessionId: string, message: string) {
  const res = await aiApi.post("/api/ai/staff-message", {
    sessionId,
    message,
  });
  return res.data;
}

export async function fetchActiveChats() {
  const res = await api.get("/ai/portal/chats");
  return res.data;
}

export async function sendPortalStaffMessage(sessionId: string, message: string) {
  return api.post(`/ai/portal/chats/${sessionId}/message`, { message });
}

export async function closeChat(sessionId: string) {
  return api.post(`/ai/portal/chats/${sessionId}/close`);
}

export async function fetchActiveAiSessions() {
  const res = await api.get("/api/ai/sessions?status=ai");
  return res.data;
}

export async function fetchAiMessages(sessionId: string) {
  const res = await api.get(`/api/ai/sessions/${sessionId}`);
  return res.data;
}

export async function takeOverSession(sessionId: string) {
  return api.post(`/api/ai/sessions/${sessionId}/takeover`);
}

export async function sendSessionStaffMessage(sessionId: string, message: string) {
  return api.post(`/api/ai/sessions/${sessionId}/message`, { message });
}

export async function closeSession(sessionId: string) {
  return api.post(`/api/ai/sessions/${sessionId}/close`);
}
