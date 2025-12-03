import { useEffect, useState, useContext } from "react";
import { MessageStreamContext } from "../../context/MessageStreamProvider";

interface MessageItem {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
}

export default function MessageList({ threadId }: { threadId: string }) {
  const { messages } = useContext(MessageStreamContext);
  const [list, setList] = useState<MessageItem[]>([]);

  useEffect(() => {
    fetch(`/api/messages/thread/${threadId}`)
      .then((r) => r.json())
      .then((d) => setList(d.data ?? []));
  }, [threadId]);

  const merged = [...list, ...messages.filter((m) => m.threadId === threadId)];

  return (
    <div className="space-y-2 p-4 bg-gray-100 rounded h-full overflow-y-auto">
      {merged.map((m) => (
        <div key={m.id} className="p-2 bg-white border rounded">
          <strong>{m.senderId}</strong>
          <div>{m.body}</div>
          <small className="text-xs opacity-70">{m.createdAt}</small>
        </div>
      ))}
    </div>
  );
}
