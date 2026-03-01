export interface CallSession {
  id: string;
  client_id: string;
  status: string;
  started_at: string;
  answered_at?: string;
  ended_at?: string;
  recording_url?: string;
  recording_duration?: number;
}

export async function fetchCallHistory(clientId: string): Promise<CallSession[]> {
  const res = await fetch(`/api/voice/history?clientId=${clientId}`, {
    credentials: "include"
  });

  if (!res.ok) throw new Error("Failed to load call history");

  return res.json();
}
