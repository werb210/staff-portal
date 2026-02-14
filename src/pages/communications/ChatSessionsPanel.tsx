import { useEffect, useMemo, useState } from "react";
import {
  fetchActiveAiSessions,
  fetchEscalatedSessions,
  fetchSessionMessages,
  sendStaffMessage,
} from "@/api/ai";
import { fetchIssueReports } from "@/api/support";
import type { AiMessage, AiSession } from "@/types/ai";

type ActiveSession = {
  id: string;
  status?: string;
  source?: string;
  takeoverState?: "ai" | "human";
};

type IssueReport = {
  id: string;
  message: string;
  createdAt: string;
};

export default function ChatSessionsPanel() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [selected, setSelected] = useState<AiSession | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);

  useEffect(() => {
    void loadSessions();
    void loadActive();
    void loadIssueReports();
  }, []);

  async function loadSessions() {
    const data = await fetchEscalatedSessions();
    setSessions(Array.isArray(data) ? data : []);
  }

  async function loadActive() {
    const data = await fetchActiveAiSessions();
    setActiveSessions(Array.isArray(data) ? data : []);
  }

  async function loadIssueReports() {
    const response = await fetchIssueReports();
    const data = response.data;
    setIssueReports(Array.isArray(data) ? data : []);
  }

  async function openSession(session: AiSession) {
    setSelected(session);
    const data = await fetchSessionMessages(session.id);
    setMessages(Array.isArray(data?.messages) ? data.messages : []);
  }

  async function send() {
    if (!selected || !input.trim()) return;

    await sendStaffMessage(selected.id, input);
    setInput("");

    const updated = await fetchSessionMessages(selected.id);
    setMessages(Array.isArray(updated?.messages) ? updated.messages : []);
    await loadActive();
  }

  const takeoverLabel = useMemo(() => {
    if (!selected) return "N/A";
    const active = activeSessions.find((session) => session.id === selected.id);
    if (!active) return selected.escalated ? "Escalated" : "AI";
    return active.takeoverState === "human" || active.status === "human" ? "Live takeover" : "AI";
  }, [activeSessions, selected]);

  return (
    <div className="space-y-4">
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">AI Escalations</h3>

        <div className="mb-2 text-sm text-slate-600">Active AI sessions: {activeSessions.length}</div>
        <div className="mb-4 text-sm text-slate-600">Escalated sessions: {sessions.length}</div>

        <div className="flex gap-4">
          <div className="w-1/3 border-r pr-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="cursor-pointer p-2 hover:bg-gray-100"
                onClick={() => void openSession(s)}
              >
                Session {s.id.slice(0, 6)}
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col">
            <div className="mb-2 text-xs text-slate-500">Takeover state: {takeoverLabel}</div>
            <div className="flex-1 overflow-auto border p-2 text-sm">
              {messages.map((m, i) => (
                <div key={`${m.sessionId}-${i}`} className="mb-1">
                  <strong>{m.role}:</strong> {m.content}
                </div>
              ))}
            </div>

            {selected && (
              <div className="mt-2 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border p-2"
                  placeholder="Reply to client..."
                />
                <button
                  onClick={() => void send()}
                  className="rounded bg-blue-600 px-4 text-white"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">Issue reports</h3>
        <div className="space-y-2 text-sm">
          {issueReports.map((issue) => (
            <div key={issue.id} className="rounded border p-2">
              <div>{issue.message}</div>
              <div className="text-xs text-slate-500">{new Date(issue.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {!issueReports.length && <div className="text-slate-500">No issue reports.</div>}
        </div>
      </div>
    </div>
  );
}
