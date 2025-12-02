import { useNotificationsStore } from "../../state/notificationsStore";
import { useEffect, useState } from "react";

export default function NotificationBell() {
  const items = useNotificationsStore((s) => s.items);
  const load = useNotificationsStore((s) => s.load);
  const [open, setOpen] = useState(false);

  const unread = items.filter((x) => !x.read).length;

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{ cursor: "pointer", position: "relative" }}
        onClick={() => setOpen(!open)}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              background: "red",
              color: "white",
              borderRadius: "50%",
              fontSize: 11,
              padding: "2px 6px",
              position: "absolute",
              top: -6,
              right: -6,
            }}
          >
            {unread}
          </span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 0,
            width: 300,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 6,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            zIndex: 20,
          }}
        >
          {items.length === 0 && <div style={{ padding: 12 }}>No notifications</div>}

          {items.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "10px 12px",
                background: n.read ? "#f9f9f9" : "#eef6ff",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
              onClick={() => useNotificationsStore.getState().markRead(n.id)}
            >
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 12 }}>{n.message}</div>
              <div style={{ fontSize: 10, color: "#777" }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
