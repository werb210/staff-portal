import React, { useEffect, useState } from "react";
import NotificationBell from "../components/nav/NotificationBell";
import { connectWebSocket, subscribe } from "../realtime/wsClient";
import { notificationsApi } from "../api/notifications";

interface AppLayoutProps {
  currentUser?: any;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppLayout({ currentUser, sidebar, children }: AppLayoutProps) {
  const [, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    (async () => {
      try {
        const res = await notificationsApi.list(currentUser.id);
        setNotifications(res.data.data ?? []);
      } catch (_) {}
    })();

    connectWebSocket(currentUser.id);

    subscribe(async (msg) => {
      if (msg.type === "notification") {
        setNotifications((prev) => [msg.payload, ...prev]);
      }

      if (msg.type === "timeline_event") {
        console.log("Timeline event received:", msg.payload);
      }
    });
  }, [currentUser]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebar}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <div className="text-xl font-bold">Staff Portal</div>
          <NotificationBell user={currentUser} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
