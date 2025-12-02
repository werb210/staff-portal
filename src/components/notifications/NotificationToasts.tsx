import { useToastStore } from "../../state/toastStore";

export default function NotificationToasts() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 50,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            minWidth: 260,
            maxWidth: 360,
            background: "#0f172a",
            color: "white",
            padding: "10px 12px",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            border: "1px solid #1f2937",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{toast.title}</div>
              <div style={{ fontSize: 13 }}>{toast.message}</div>
            </div>
            <button
              onClick={() => remove(toast.id)}
              style={{
                background: "transparent",
                color: "#cbd5e1",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
