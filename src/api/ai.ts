import api from "./client";

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

export async function sendStaffMessage(sessionId: string, message: string) {
  return api.post(`/api/ai/sessions/${sessionId}/message`, { message });
}

export async function closeSession(sessionId: string) {
  return api.post(`/api/ai/sessions/${sessionId}/close`);
}
