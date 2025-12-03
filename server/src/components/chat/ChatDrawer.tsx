import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import { useAuthStore } from "../../state/authStore";

interface ChatDrawerProps {
  threadId: string;
  otherUserId: string;
}

export default function ChatDrawer({ threadId, otherUserId }: ChatDrawerProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-xl flex flex-col border-l">
      <div className="p-4 border-b font-semibold">Chat</div>

      <div className="flex-1 overflow-y-auto">
        <MessageList threadId={threadId} />
      </div>

      <MessageComposer threadId={threadId} senderId={user.id} recipientId={otherUserId} />
    </div>
  );
}
