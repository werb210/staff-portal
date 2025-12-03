import React from "react";
import { X } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useAtom } from "jotai";
import { chatMessagesAtom } from "@/state/chatMessages";

export default function ChatDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages] = useAtom(chatMessagesAtom);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl border-l border-gray-200 z-[9999] transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Chat</h2>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 h-[calc(100%-64px)]">
        <div className="h-full flex flex-col">
          <MessageList messages={messages} />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
