import { useEffect } from "react";
import { useNotificationsStore } from "@/state/notifications.store";

const NotificationToast = () => {
  const { toast, clearToast, markRead } = useNotificationsStore();

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => {
      markRead(toast.id);
      clearToast();
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [clearToast, markRead, toast]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-80 rounded border border-slate-200 bg-white px-4 py-3 text-sm shadow"
      role="status"
      data-testid="notification-toast"
    >
      <div className="text-xs uppercase tracking-wide text-emerald-600">{toast.type}</div>
      <div className="font-semibold text-slate-900">{toast.title}</div>
      <div className="text-slate-600">{toast.message}</div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{toast.source === "push" ? "Push" : "In-app"}</span>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700"
          onClick={() => {
            markRead(toast.id);
            clearToast();
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
