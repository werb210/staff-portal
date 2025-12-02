import React from "react";

export type Conversation = {
  id: string;
  name: string;
  unread?: number;
  lastMessage: string;
};

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`w-full rounded-lg border px-3 py-2 text-left transition ${
            activeId === conversation.id
              ? "border-indigo-200 bg-indigo-50 text-indigo-800"
              : "border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>{conversation.name}</span>
            {conversation.unread ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                {conversation.unread}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-slate-500">{conversation.lastMessage}</p>
        </button>
      ))}
    </div>
  );
}
