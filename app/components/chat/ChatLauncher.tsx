import React from "react";
import { MessageCircle } from "lucide-react";
import { useSetAtom } from "jotai";
import { openChatDrawer } from "@/state/chatDrawerState";

export default function ChatLauncher() {
  const open = useSetAtom(openChatDrawer);

  return (
    <button
      onClick={() => open()}
      className="fixed bottom-6 right-6 z-[9998] bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl p-4 transition"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
