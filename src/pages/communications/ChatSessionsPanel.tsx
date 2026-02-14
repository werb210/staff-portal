import { useEffect, useMemo, useState } from "react";
import {
  closeEscalatedChat,
  createHumanEscalation,
  deleteIssue,
  fetchCommunicationThreads,
  fetchConversationById,
  sendCommunication
} from "@/api/communications";
import { connectAiSocket } from "@/services/aiSocket";
import type { CommunicationConversation, CommunicationMessage } from "@/api/communications";

type ConnectionState = "connecting" | "connected" | "disconnected";

const conversationLabel = (conversation: CommunicationConversation) => {
  if (conversation.status === "closed") return "Closed";
  if (conversation.status === "human" || conversation.type === "human") return "Human";
  return "AI";
};

export default function ChatSessionsPanel() {
  const [sessions, setSessions] = useState<CommunicationConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [input, setInput] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  const selected = useMemo(
    () => (selectedId ? sessions.find((session) => session.id === selectedId) ?? null : null),
    [selectedId, sessions]
  );

  const issueReports = useMemo(() => sessions.filter((session) => session.type === "issue"), [sessions]);

  const activeEscalations = useMemo(
    () => sessions.filter((session) => (session.type === "human" || session.type === "chat") && session.status !== "closed"),
    [sessions]
  );

  const dedupeSessions = (items: CommunicationConversation[]) => {
    const byId = new Map<string, CommunicationConversation>();
    items.forEach((item) => {
      byId.set(item.id, item);
    });
    return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  };

  const loadSessions = async () => {
    const data = await fetchCommunicationThreads();
    setSessions(dedupeSessions(data));
  };

  useEffect(() => {
    void loadSessions();

    const disconnect = connectAiSocket();
    setConnectionState("connected");

    const poll = window.setInterval(() => {
      void loadSessions();
    }, 5000);

    return () => {
      window.clearInterval(poll);
      disconnectAiSocketSafe(disconnect);
      setConnectionState("disconnected");
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    void fetchConversationById(selectedId).then((conversation) => {
      setMessages(conversation.messages);
    });
  }, [selectedId, sessions]);

  async function openSession(conversation: CommunicationConversation) {
    setSelectedId(conversation.id);
    const updated = await fetchConversationById(conversation.id);
    setMessages(updated.messages);
  }

  async function joinAsHuman(conversation: CommunicationConversation) {
    if (conversation.type === "human") return;
    await createHumanEscalation({
      applicationId: conversation.applicationId,
      applicationName: conversation.applicationName,
      contactId: conversation.contactId,
      contactName: conversation.contactName,
      silo: conversation.silo,
      message: "Staff joined this AI chat."
    });
    await loadSessions();
  }

  async function send() {
    if (!selected || !input.trim()) return;
    await sendCommunication(selected.id, input, selected.type);
    setInput("");
    await loadSessions();
  }

  async function closeSession() {
    if (!selected) return;
    const transcript = messages.map((message) => `${message.direction}: ${message.message}`).join("\n");
    await closeEscalatedChat(selected.id, transcript);
    await loadSessions();
    setSelectedId(null);
  }

  async function markIssueResolved(conversationId: string) {
    await closeEscalatedChat(conversationId, "Issue resolved by staff.");
    await loadSessions();
  }

  async function removeIssue(conversationId: string) {
    await deleteIssue(conversationId);
    await loadSessions();
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">AI Escalations</h3>

        <div className="mb-2 text-sm text-slate-600">Connection: {connectionState}</div>
        <div className="mb-2 text-sm text-slate-600">Active sessions: {activeEscalations.length}</div>

        <div className="flex gap-4">
          <div className="w-1/3 border-r pr-2">
            {activeEscalations.map((session) => (
              <div key={session.id} className="cursor-pointer p-2 hover:bg-gray-100" onClick={() => void openSession(session)}>
                <div>Session {session.id.slice(0, 6)}</div>
                <div className="text-xs text-slate-500">Status: {conversationLabel(session)}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col">
            <div className="mb-2 text-xs text-slate-500">Status: {selected ? conversationLabel(selected) : "N/A"}</div>
            <div className="flex-1 overflow-auto border p-2 text-sm">
              {messages.map((message, index) => (
                <div key={`${message.id}-${index}`} className="mb-1">
                  <strong>{message.direction}:</strong> {message.message}
                </div>
              ))}
            </div>

            {selected && (
              <div className="mt-2 flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="flex-1 border p-2"
                  placeholder="Reply to client..."
                />
                <button onClick={() => void send()} className="rounded bg-blue-600 px-4 text-white">
                  Send
                </button>
                <button onClick={() => void joinAsHuman(selected)} className="rounded bg-amber-600 px-4 text-white">
                  Join
                </button>
                <button onClick={() => void closeSession()} className="rounded bg-slate-700 px-4 text-white">
                  Close
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
              <div>{issue.messages[0]?.message}</div>
              <div className="text-xs text-slate-500">
                {String(issue.metadata?.context ?? "website")} · {new Date(issue.createdAt).toLocaleString()}
              </div>
              {typeof issue.metadata?.screenshot === "string" ? (
                <a className="text-blue-600 underline" href={issue.metadata.screenshot as string} rel="noreferrer" target="_blank">
                  Screenshot preview
                </a>
              ) : null}
              <div className="mt-2 flex gap-2">
                <button onClick={() => void markIssueResolved(issue.id)} className="rounded bg-emerald-600 px-3 py-1 text-white">
                  Mark resolved
                </button>
                <button onClick={() => void removeIssue(issue.id)} className="rounded bg-rose-600 px-3 py-1 text-white">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!issueReports.length && <div className="text-slate-500">No issue reports.</div>}
        </div>
      </div>
    </div>
  );
}

function disconnectAiSocketSafe(disconnect?: unknown) {
  if (typeof disconnect === "function") {
    disconnect();
  }
}
