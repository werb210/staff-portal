import { useCallback, useEffect, useState } from "react";
import { closeAiSession, fetchAiMessages, fetchAiSessions } from "@/api/aiSessions";
import type { AiSession, AiSessionMessage } from "@/features/comms/aiSessions";
import { connectToAiSession } from "@/hooks/useAiSocket";

export default function AiChatPanel() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [active, setActive] = useState<AiSession | null>(null);
  const [messages, setMessages] = useState<AiSessionMessage[]>([]);

  const loadSessions = useCallback(async () => {
    const res = await fetchAiSessions();
    setSessions(res.data);
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!active) return;
    const disconnect = connectToAiSession(active.id, (message) => {
      setMessages((current) => [...current, message as AiSessionMessage]);
    });

    return disconnect;
  }, [active]);

  async function openSession(session: AiSession) {
    setActive(session);
    const res = await fetchAiMessages(session.id);
    setMessages(res.data);
  }

  async function handleClose() {
    if (!active) return;
    await closeAiSession(active.id);
    setActive(null);
    setMessages([]);
    await loadSessions();
  }

  return (
    <div className="flex h-[70vh]">
      <div className="w-1/3 overflow-auto border-r">
        {sessions.map((s) => (
          <div key={s.id} onClick={() => void openSession(s)} className="cursor-pointer border-b p-3 hover:bg-gray-100">
            <div className="font-semibold">{s.companyName || s.fullName || "Visitor"}</div>
            <div className="text-xs text-gray-500">{s.status}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex-1 overflow-auto p-4">
              {messages.map((m, i) => (
                <div key={`${m.id ?? i}-${i}`} className="mb-2 text-sm">
                  <strong>{m.role}:</strong> {m.content}
                </div>
              ))}
            </div>

            <button onClick={() => void handleClose()} className="bg-black py-3 text-white">
              Close &amp; Push to CRM
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Select an AI session to view live chat.
          </div>
        )}
      </div>
    </div>
  );
}
