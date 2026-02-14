import api from "./client";

export async function fetchActiveChats() {
  const res = await api.get("/ai/portal/chats");
  return res.data;
}

export async function sendStaffMessage(sessionId: string, message: string) {
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
