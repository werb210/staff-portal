import { useEffect } from "react";
import { clearApiToast, useApiNotificationsStore } from "@/state/apiNotifications";

const ApiErrorToast = () => {
  const toast = useApiNotificationsStore((state) => state.toast);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => {
      clearApiToast();
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded bg-red-600 px-4 py-2 text-sm text-white shadow" role="alert">
      <div>{toast.message}</div>
      {toast.requestId && <div className="text-xs opacity-80">Request ID: {toast.requestId}</div>}
    </div>
  );
};

export default ApiErrorToast;
