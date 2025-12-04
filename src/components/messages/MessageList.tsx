import React from "react";
import MessageItem from "./MessageItem";

export default function MessageList({ messages }) {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((m) => (
        <MessageItem key={m.id} msg={m} />
      ))}
    </div>
  );
}
