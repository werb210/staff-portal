import { useEffect, useState } from "react";

interface ChatSession {
  id: string;
  companyName?: string;
  fullName?: string;
  status: "active" | "closed";
}

export default function LiveChatPanel() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    fetch("/api/chat/sessions")
      .then((res) => res.json())
      .then(setSessions);
  }, []);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Active Chat Sessions</h2>

      {sessions.map((session) => (
        <div key={session.id} className="mb-3 rounded border p-4">
          <div>{session.companyName || "Unknown Company"}</div>
          <div className="text-sm text-gray-500">{session.fullName}</div>
          <div className="text-xs text-blue-600">{session.status}</div>
        </div>
      ))}
    </div>
  );
}
