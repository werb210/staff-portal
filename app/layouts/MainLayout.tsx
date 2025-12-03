import React from "react";
import { useAtom } from "jotai";
import ChatDrawer from "@/components/chat/ChatDrawer";
import ChatLauncher from "@/components/chat/ChatLauncher";
import { chatDrawerOpenAtom, closeChatDrawer } from "@/state/chatDrawerState";

interface MainLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function MainLayout({ sidebar, children }: MainLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useAtom(chatDrawerOpenAtom);
  const [, closeDrawer] = useAtom(closeChatDrawer);

  const handleClose = () => {
    setIsChatOpen(false);
    closeDrawer();
  };

  return (
    <>
      <div className="flex w-full h-full">
        {sidebar}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      <ChatDrawer isOpen={isChatOpen} onClose={handleClose} />

      <ChatLauncher />
    </>
  );
}
