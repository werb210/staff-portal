import React from "react";
import { useSetAtom } from "jotai";
import { MessageSquare } from "lucide-react";
import { openChatDrawer } from "@/state/chatDrawerState";

export default function Header() {
  const open = useSetAtom(openChatDrawer);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="text-2xl font-bold text-blue-600">Staff Portal</div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => open()}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
        </button>
      </div>
    </header>
  );
}
