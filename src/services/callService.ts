export interface CallSession {
  id: string;
  direction: "inbound" | "outbound";
  status: string;
  started_at: string;
  duration_seconds?: number;
  voicemail_url?: string | null;
}

export async function fetchCallHistory(clientId: string): Promise<CallSession[]> {
  const res = await fetch(`/api/voice/history?client_id=${clientId}`, {
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to load call history");
  }

  const data: unknown = await res.json();

  if (!Array.isArray(data)) return [];

  return data.map((call: unknown) => {
    const c = (call ?? {}) as Record<string, unknown>;
    const direction = c.direction === "outbound" ? "outbound" : "inbound";

    return {
      id: String(c.id),
      direction,
      status: typeof c.status === "string" ? c.status : "unknown",
      started_at: typeof c.started_at === "string" ? c.started_at : "",
      duration_seconds: typeof c.duration_seconds === "number" ? c.duration_seconds : 0,
      voicemail_url: typeof c.voicemail_url === "string" ? c.voicemail_url : null
    };
  });
}
