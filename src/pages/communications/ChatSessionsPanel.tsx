import { useEffect, useState } from "react";
import { fetchChatSessions } from "@/api/crm";
import type { ChatSession } from "@/types/chat";

export default function ChatSessionsPanel() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    void fetchChatSessions().then((data) => setSessions(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Active AI Sessions</h2>

      {sessions.map((s) => (
        <div key={s.id} className="rounded border bg-neutral-900 p-4 text-white">
          <div className="flex justify-between">
            <div>Lead ID: {s.leadId}</div>
            <div className="text-xs uppercase opacity-70">{s.status}</div>
          </div>

          <div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs">
            {s.messages.map((m, i) => (
              <div key={`${s.id}-${i}`}>
                <strong>{m.role}:</strong> {m.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
