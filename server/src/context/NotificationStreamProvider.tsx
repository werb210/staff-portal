import { createContext, useEffect, useState } from "react";
import { startSocket, onSocketMessage } from "../realtime/socket";
import { useAuthStore } from "../state/authStore";

export const NotificationStreamContext = createContext({});

export default function NotificationStreamProvider({ children }: any) {
  const user = useAuthStore((s) => s.user);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      startSocket(user.id);

      const unsubscribe = onSocketMessage((msg) => {
        setEvents((prev) => [...prev, msg]);
      });

      return unsubscribe;
    }
  }, [user?.id]);

  return (
    <NotificationStreamContext.Provider value={{ events }}>
      {children}
    </NotificationStreamContext.Provider>
  );
}
