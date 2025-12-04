import React, { useEffect, useState } from "react";
import { notificationsApi } from "../../api/notifications";

export default function NotificationsPage({ user }) {
  const [rows, setRows] = useState([]);

  async function load() {
    const res = await notificationsApi.list(user.id);
    setRows(res.data.data);
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      <div className="flex flex-col gap-3">
        {rows.map((n) => (
          <div
            key={n.id}
            className={`p-3 border rounded ${
              n.read ? "bg-white" : "bg-yellow-50"
            }`}
          >
            <div className="font-medium">{n.type}</div>
            <div>{n.message}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
