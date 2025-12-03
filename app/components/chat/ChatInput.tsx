"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { useSetAtom } from "jotai";
import { chatMessagesAtom } from "@/state/chatMessages";

export default function ChatInput() {
  const [text, setText] = useState("");
  const pushMessage = useSetAtom(chatMessagesAtom);

  const send = () => {
    if (!text.trim()) return;

    pushMessage((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "staff",
        text: text.trim(),
        timestamp: Date.now(),
      },
    ]);

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
