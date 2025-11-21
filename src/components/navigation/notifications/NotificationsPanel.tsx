import { Bell, CheckCircle, TriangleAlert } from "lucide-react";

const mockNotifications = [
  { id: "1", title: "New application submitted", type: "event" },
  { id: "2", title: "Document upload failed", type: "alert" },
  { id: "3", title: "AI suggestion ready", type: "ai" },
  { id: "4", title: "Task assigned to you", type: "task" },
];

export default function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!open) return null;
  return (
    <div className="fixed right-4 top-20 z-30 w-80 rounded-lg border bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="h-4 w-4" /> Notifications
        </div>
        <button className="text-xs text-muted-foreground" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
      <div className="space-y-2 p-3 text-sm">
        {mockNotifications.map((item) => (
          <div key={item.id} className="flex items-start gap-2 rounded-md border p-2">
            {item.type === "alert" ? (
              <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
            )}
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
