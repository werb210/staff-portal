import { useEffect, useState } from "react";
import { getHumanSessions } from "../api";
import type { ChatSession } from "../types";

type ChatQueueProps = {
  selectedSessionId?: string;
  onSelectSession: (session: ChatSession) => void;
  refreshToken?: number;
};

const ChatQueue = ({ onSelectSession, selectedSessionId, refreshToken = 0 }: ChatQueueProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSessions = async () => {
      try {
        const data = await getHumanSessions();
        if (mounted) {
          setSessions(data);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSessions();
    const interval = window.setInterval(() => {
      void loadSessions();
    }, 10_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [refreshToken]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading live chat queue…</p>;
  }

  if (!sessions.length) {
    return <p className="text-sm text-slate-500">No active human sessions.</p>;
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isSelected = selectedSessionId === session.id;
        return (
          <article key={session.id} className={`rounded-lg border p-3 ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}>
            <p className="font-medium text-slate-900">{session.lead_name || "Unassigned lead"}</p>
            <p className="text-xs text-slate-600">Source: {session.source}</p>
            <p className="text-xs text-slate-500">Started: {new Date(session.created_at).toLocaleString()}</p>
            <button
              type="button"
              className="mt-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              onClick={() => onSelectSession(session)}
            >
              Open
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default ChatQueue;
