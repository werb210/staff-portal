import React from "react";
import { ChatMessage } from "@/types/chat";
import { formatTimestamp } from "@/utils/formatTimestamp";

type Props = { msg: ChatMessage };

export default function MessageBubble({ msg }: Props) {
  const isStaff = msg.role === "staff";
  const isClient = msg.role === "client";

  return (
    <div className={`w-full flex ${isStaff ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-xl shadow-sm
          ${isStaff ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}
        `}
      >
        <div className="whitespace-pre-wrap">{msg.text}</div>
        <div className={`mt-1 text-xs opacity-70 ${isStaff ? "text-white" : "text-gray-600"}`}>
          {formatTimestamp(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}
