import React, { useMemo, useState } from "react";
import { ConversationList, Conversation } from "./ConversationList";
import { MessageThread, Message } from "./MessageThread";
import { ComposerPayload, MessageComposer } from "./MessageComposer";

const mockConversations: Conversation[] = [
  { id: "general", name: "General", unread: 2, lastMessage: "Can you confirm bank statements?" },
  { id: "underwriting", name: "Underwriting", lastMessage: "Need NOA for 2023." },
  { id: "docs", name: "Docs Team", lastMessage: "Re-upload void cheque" },
];

const mockMessages: Record<string, Message[]> = {
  general: [
    { id: "m1", from: "Jessie", text: "Need quick eyes on the collateral schedule.", time: "9:14 AM" },
    { id: "m2", from: "Omar", text: "On it, also missing the T12.", time: "9:20 AM", attachments: ["t12.xlsx"] },
  ],
  underwriting: [
    { id: "m3", from: "Sam", text: "NOA 2023 uploaded?", time: "Yesterday" },
    { id: "m4", from: "Jessie", text: "Waiting on borrower.", time: "Yesterday" },
  ],
  docs: [
    { id: "m5", from: "Alex", text: "Void cheque image is blurry.", time: "Mon" },
    { id: "m6", from: "Tina", text: "Requesting a clearer copy.", time: "Mon", attachments: ["request-template.docx"] },
  ],
};

export default function ChatPanel() {
  const [activeId, setActiveId] = useState("general");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const thread = useMemo(() => messages[activeId] ?? [], [messages, activeId]);

  const handleSend = (payload: ComposerPayload) => {
    const next: Message = {
      id: crypto.randomUUID(),
      from: "You",
      text: payload.text,
      attachments: payload.attachments,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), next] }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">Conversations</div>
        <ConversationList conversations={mockConversations} activeId={activeId} onSelect={setActiveId} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">{activeId} channel</h4>
            <p className="text-sm text-slate-600">Mock staff chat with attachments.</p>
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Internal</div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg bg-slate-50 p-3">
          <MessageThread messages={thread} />
        </div>

        <MessageComposer onSend={handleSend} />
      </div>
    </div>
  );
}
