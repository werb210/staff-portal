import { useEffect, useMemo, useState } from "react";
import {
  applyHumanActiveState,
  archiveIssue,
  closeEscalatedChat,
  createHumanEscalation,
  deleteIssue,
  fetchCommunicationThreads,
  fetchConversationById,
  sendCommunication
} from "@/api/communications";
import { connectAiSocket, subscribeAiSocket, subscribeAiSocketConnection } from "@/services/aiSocket";
import type { CommunicationConversation, CommunicationMessage } from "@/api/communications";

type ConnectionState = "connecting" | "connected" | "disconnected";

const conversationLabel = (conversation: CommunicationConversation) => {
  if (conversation.status === "closed") return "Closed";
  if (conversation.metadata?.aiPaused) return "AI paused";
  if (conversation.status === "human" || conversation.type === "human") return "Human";
  return "AI";
};

const readinessBadge = (conversation: CommunicationConversation) => {
  const progression = String(conversation.metadata?.progression ?? "").toLowerCase();
  if (progression === "application_submitted") return "Application Submitted";
  if (progression === "application_started") return "Application Started";
  return "Readiness Only";
};

export default function ChatSessionsPanel() {
  const [sessions, setSessions] = useState<CommunicationConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [input, setInput] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? sessions.find((session) => session.id === selectedId) ?? null : null),
    [selectedId, sessions]
  );

  const issueReports = useMemo(() => sessions.filter((session) => session.type === "issue"), [sessions]);

  const activeEscalations = useMemo(
    () =>
      sessions.filter(
        (session) => (session.type === "human" || session.type === "chat" || session.type === "credit_readiness") && session.status !== "closed"
      ),
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
    try {
      const data = await fetchCommunicationThreads();
      setSessions(dedupeSessions(data));
      setError(null);
    } catch (loadError) {
      console.error("Failed to load chat sessions", loadError);
      setError("Unable to refresh sessions.");
    }
  };

  useEffect(() => {
    void loadSessions();

    const disconnect = connectAiSocket();
    const unsubscribeConnection = subscribeAiSocketConnection((state) => setConnectionState(state));
    const unsubscribeEscalated = subscribeAiSocket("escalated_chat", () => {
      void loadSessions();
    });
    const unsubscribeIssue = subscribeAiSocket("new_issue_report", () => {
      void loadSessions();
    });
    const unsubscribeHumanActive = subscribeAiSocket("HUMAN_ACTIVE", (payload) => {
      if (payload.sessionId) {
        void applyHumanActiveState(payload.sessionId)
          .then(() => loadSessions())
          .catch((stateError) => {
            console.error("Failed to apply HUMAN_ACTIVE state", stateError);
          });
      } else {
        void loadSessions();
      }
    });

    const poll = window.setInterval(() => {
      void loadSessions();
    }, 5000);

    return () => {
      window.clearInterval(poll);
      unsubscribeConnection();
      unsubscribeEscalated();
      unsubscribeIssue();
      unsubscribeHumanActive();
      disconnectAiSocketSafe(disconnect);
      setConnectionState("disconnected");
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    void fetchConversationById(selectedId)
      .then((conversation) => {
        setMessages(conversation.messages);
      })
      .catch((fetchError) => {
        console.error("Failed to fetch selected conversation", fetchError);
      });
  }, [selectedId, sessions]);

  async function openSession(conversation: CommunicationConversation) {
    try {
      setSelectedId(conversation.id);
      const updated = await fetchConversationById(conversation.id);
      setMessages(updated.messages);
    } catch (openError) {
      console.error("Failed to open session", openError);
      setError("Unable to open the selected session.");
    }
  }

  async function joinAsHuman(conversation: CommunicationConversation) {
    if (conversation.type === "human") return;
    try {
      await createHumanEscalation({
        applicationId: conversation.applicationId,
        applicationName: conversation.applicationName,
        contactId: conversation.contactId,
        contactName: conversation.contactName,
        silo: conversation.silo,
        message: "Staff joined this AI chat."
      });
      await loadSessions();
    } catch (joinError) {
      console.error("Failed to join session as human", joinError);
      setError("Unable to join the session.");
    }
  }

  async function send() {
    if (!selected || !input.trim()) return;
    try {
      await sendCommunication(selected.id, input, selected.type);
      setInput("");
      await loadSessions();
    } catch (sendError) {
      console.error("Failed to send message", sendError);
      setError("Unable to send message.");
    }
  }

  async function closeSession() {
    if (!selected) return;
    try {
      const transcript = messages.map((message) => `${message.direction}: ${message.message}`).join("\n");
      await closeEscalatedChat(selected.id, transcript);
      await loadSessions();
      setSelectedId(null);
    } catch (closeError) {
      console.error("Failed to close session", closeError);
      setError("Unable to close the session.");
    }
  }

  async function markIssueResolved(conversationId: string) {
    try {
      await closeEscalatedChat(conversationId, "Issue resolved by staff.");
      await loadSessions();
    } catch (resolveError) {
      console.error("Failed to resolve issue", resolveError);
      setError("Unable to mark issue resolved.");
    }
  }

  async function archiveIssueReport(conversationId: string) {
    try {
      await archiveIssue(conversationId);
      await loadSessions();
    } catch (archiveError) {
      console.error("Failed to archive issue", archiveError);
      setError("Unable to archive issue.");
    }
  }

  async function removeIssue(conversationId: string) {
    try {
      await deleteIssue(conversationId);
      await loadSessions();
    } catch (deleteError) {
      console.error("Failed to delete issue", deleteError);
      setError("Unable to delete issue.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">AI Escalations</h3>

        <div className="mb-2 text-sm text-slate-600">Connection: {connectionState}</div>
        <div className="mb-2 text-sm text-slate-600">Active sessions: {activeEscalations.length}</div>
        {error ? <div className="mb-2 text-sm text-rose-700">{error}</div> : null}

        <div className="flex gap-4">
          <div className="w-1/3 border-r pr-2">
            {activeEscalations.map((session) => (
              <div key={session.id} className="cursor-pointer p-2 hover:bg-gray-100" onClick={() => void openSession(session)}>
                <div>Session {(session.sessionId ?? session.id).slice(0, 10)}</div>
                {session.readinessToken ? (
                  <div className="text-xs text-slate-500">Readiness token: {session.readinessToken}</div>
                ) : null}
                <div className="text-xs text-slate-500">Status: {conversationLabel(session)}</div>
                {(session.contactName || session.contactEmail || session.contactPhone) && (
                  <div className="text-xs text-slate-500">
                    Contact: {session.contactName ?? "Unknown"}
                    {session.contactEmail ? ` · ${session.contactEmail}` : ""}
                    {session.contactPhone ? ` · ${session.contactPhone}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col">
            <div className="mb-2 text-xs text-slate-500">Status: {selected ? conversationLabel(selected) : "N/A"}</div>
            {selected?.type === "credit_readiness" ? (
              <div className="mb-2 inline-block rounded border border-slate-300 px-2 py-1 text-xs text-slate-600">
                {readinessBadge(selected)}
              </div>
            ) : null}
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
                Session: {issue.sessionId ?? issue.id} · {String(issue.metadata?.context ?? "website")} ·
                {` ${new Date(issue.createdAt).toLocaleString()}`}
              </div>
              {typeof issue.metadata?.screenshot === "string" ? (
                <div className="mt-1 space-y-1">
                  <img src={issue.metadata.screenshot as string} alt="Issue screenshot" className="max-h-32 border" />
                  <a
                    className="text-blue-600 underline"
                    href={issue.metadata.screenshot as string}
                    rel="noreferrer"
                    target="_blank"
                    download
                  >
                    Download screenshot
                  </a>
                </div>
              ) : null}
              <div className="mt-2 flex gap-2">
                <button onClick={() => void markIssueResolved(issue.id)} className="rounded bg-emerald-600 px-3 py-1 text-white">
                  Mark resolved
                </button>
                <button onClick={() => void archiveIssueReport(issue.id)} className="rounded bg-slate-600 px-3 py-1 text-white">
                  Archive
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
