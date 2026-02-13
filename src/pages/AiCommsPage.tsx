import { useEffect, useState } from "react";

type ChatSession = {
  id: string;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status: "open" | "closed";
  messages: { role: string; content: string }[];
};

export default function AiCommsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [active, setActive] = useState<ChatSession | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetch("/api/ai/sessions")
      .then((response) => response.json())
      .then(setSessions);
  }, []);

  async function sendReply() {
    if (!active || !reply.trim()) {
      return;
    }

    await fetch(`/api/ai/sessions/${active.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply })
    });

    setReply("");
  }

  async function closeSession() {
    if (!active) {
      return;
    }

    await fetch(`/api/ai/sessions/${active.id}/close`, {
      method: "POST"
    });

    setActive(null);
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 overflow-auto border-r p-4">
        <h2 className="mb-4 font-semibold">AI Chat Sessions</h2>
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActive(session)}
            className="mb-2 cursor-pointer border p-3 hover:bg-gray-50"
          >
            <div>{session.companyName || "Unknown Company"}</div>
            <div className="text-xs text-gray-500">
              {session.fullName} — {session.status}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex justify-between border-b p-4 font-semibold">
              <div>
                <div>{active.companyName || "Unknown Company"}</div>
                <div className="text-xs font-normal text-gray-500">
                  {active.fullName || "Unknown User"}
                  {active.email ? ` • ${active.email}` : ""}
                  {active.phone ? ` • ${active.phone}` : ""}
                </div>
              </div>
              <button onClick={closeSession} className="text-sm text-red-600">
                Close
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-auto p-4">
              {active.messages.map((message, index) => (
                <div key={index} className={message.role === "assistant" ? "text-left" : "text-right"}>
                  {message.content}
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t p-4">
              <input
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                className="flex-1 border p-2"
                placeholder="Reply..."
              />
              <button onClick={sendReply} className="bg-black px-4 text-white">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">Select a session</div>
        )}
      </div>
    </div>
  );
}
