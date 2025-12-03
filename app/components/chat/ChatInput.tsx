"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { chatMessagesAtom } from "@/state/chatMessages";
import { chatConversationIdAtom } from "@/state/chatConversationId";
import { apiSendMessage } from "@/utils/chatApi";

export default function ChatInput() {
  const [text, setText] = useState("");
  const [conversationId] = useAtom(chatConversationIdAtom);
  const pushMessage = useSetAtom(chatMessagesAtom);

  const send = async () => {
    if (!text.trim() || !conversationId) return;

    const messageText = text.trim();

    const local = {
      id: crypto.randomUUID(),
      role: "staff" as const,
      text: messageText,
      timestamp: Date.now(),
    };

    pushMessage((prev) => [...prev, local]);

    await apiSendMessage(conversationId, "staff", messageText);

    setText("");
  };

  return (
    <div className="p-4 border-t bg-white flex items-center gap-3">
      <input
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button
        onClick={send}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
