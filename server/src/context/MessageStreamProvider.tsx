import { createContext, useEffect, useState } from "react";
import { onSocketMessage } from "../realtime/socket";
import { useAuthStore } from "../state/authStore";

export const MessageStreamContext = createContext({
  messages: [] as any[],
});

export default function MessageStreamProvider({ children }: any) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    setMessages([]);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const unsub = onSocketMessage((msg) => {
      if (msg?.event === "message") {
        setMessages((p) => [...p, msg.data]);
      }
    });
    return unsub;
  }, [user?.id]);

  return (
    <MessageStreamContext.Provider value={{ messages }}>
      {children}
    </MessageStreamContext.Provider>
  );
}
