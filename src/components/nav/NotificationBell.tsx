import React, { useEffect, useState } from "react";
import { notificationsApi } from "../../api/notifications";
import { subscribe } from "../../realtime/wsClient";

export default function NotificationBell({ user }) {
  const [count, setCount] = useState(0);

  async function fetchUnread() {
    if (!user?.id) return;
    const res = await notificationsApi.unread(user.id);
    setCount(res.data.data.length);
  }

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);

    subscribe((msg) => {
      if (msg.type === "notification") {
        setCount((c) => c + 1);
      }
    });

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="relative cursor-pointer">
      <span className="material-icons text-gray-700 text-3xl">notifications</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
          {count}
        </span>
      )}
    </div>
  );
}
