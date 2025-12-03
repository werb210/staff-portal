"use client";

import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageListEmpty from "./MessageListEmpty";
import { ChatMessage } from "@/types/chat";

type Props = {
  messages: ChatMessage[];
};

export default function MessageList({ messages }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && <MessageListEmpty />}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
    </div>
  );
}
