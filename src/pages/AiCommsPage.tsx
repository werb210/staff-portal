import { useCallback, useEffect, useState } from "react";
import {
  closeSession,
  fetchActiveAiSessions,
  fetchAiMessages,
  sendStaffMessage,
  takeOverSession
} from "@/api/ai";
import { useAiSocket } from "@/hooks/useAiSocket";

type AiSession = {
  id: string;
  source?: string;
  status: string;
};

type AiMessage = {
  role: string;
  content: string;
};

function AiSessionsPanel() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [selected, setSelected] = useState<AiSession | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");

  const loadSessions = useCallback(async () => {
    const data = await fetchActiveAiSessions();
    setSessions(data);
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    const data = await fetchAiMessages(sessionId);
    setSelected(data.session);
    setMessages(data.messages);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useAiSocket(selected?.id ?? null, (incomingMessage) => {
    setMessages((current) => [...current, incomingMessage]);
  });

  async function handleTakeover() {
    if (!selected) return;
    await takeOverSession(selected.id);
    await loadMessages(selected.id);
    await loadSessions();
  }

  async function handleSend() {
    if (!selected || !input.trim()) return;
    await sendStaffMessage(selected.id, input);
    setInput("");
    await loadMessages(selected.id);
  }

  async function handleClose() {
    if (!selected) return;
    await closeSession(selected.id);
    setSelected(null);
    setMessages([]);
    await loadSessions();
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r p-3">
        <h3 className="mb-2 font-semibold">AI Conversations</h3>
        {sessions.map((session) => (
          <div
            key={session.id}
            className="cursor-pointer p-2 hover:bg-gray-100"
            onClick={() => loadMessages(session.id)}
          >
            {session.source ?? "chat"} — {session.status}
          </div>
        ))}
      </div>

      {selected ? (
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "assistant" ? "text-gray-600" : "text-black"}>
                <strong>{message.role}</strong>: {message.content}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t p-3">
            {selected.status === "ai" && (
              <button onClick={handleTakeover} className="rounded bg-yellow-500 px-3 py-2 text-white">
                Take Over Chat
              </button>
            )}

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="flex-1 border p-2"
              />
              <button onClick={handleSend} className="rounded bg-blue-600 px-4 text-white">
                Send
              </button>
            </div>

            <button onClick={handleClose} className="rounded bg-red-600 px-3 py-2 text-white">
              Close Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-400">Select a session</div>
      )}
    </div>
  );
}

export default function AiCommsPage() {
  return <AiSessionsPanel />;
}
