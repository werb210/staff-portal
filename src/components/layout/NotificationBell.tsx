import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import RetryButton from "@/components/states/RetryButton";

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: string;
  type: "SMS" | "Document" | "Pipeline" | "Internal" | string;
  read?: boolean;
}

async function fetchNotifications() {
  const res = await fetch(`/api/notifications?limit=20`);
  if (!res.ok) throw new Error("Failed to load notifications");
  return (await res.json()) as NotificationItem[];
}

async function markRead(id: string) {
  const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to update notification");
  return res.json();
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
    staleTime: 60_000,
  });

  const unread = notificationsQuery.data?.filter((n) => !n.read).length ?? 0;

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        Notifications
        {unread > 0 && <Badge className="ml-2" variant="destructive">{unread}</Badge>}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Alerts</span>
            <Button variant="ghost" size="sm" onClick={() => notificationsQuery.refetch()}>Refresh</Button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {notificationsQuery.isLoading && <LoadingState label="Loading notifications" />}
            {notificationsQuery.isError && (
              <ErrorState
                message="Unable to load notifications"
                onRetry={() => notificationsQuery.refetch()}
              />
            )}
            {notificationsQuery.data?.map((item) => (
              <div
                key={item.id}
                className="rounded-md border px-3 py-2 text-sm shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.title}</span>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                {!item.read && (
                  <RetryButton
                    label="Mark as read"
                    onRetry={() => markReadMutation.mutate(item.id)}
                  />
                )}
              </div>
            ))}
            {notificationsQuery.data?.length === 0 && !notificationsQuery.isLoading && (
              <p className="text-sm text-slate-600">No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
