import { useState } from "react";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockNotifications = [
  { id: "1", title: "Welcome to the staff portal", type: "system", timestamp: new Date().toISOString() },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <Bell className="mr-2 h-4 w-4" />
        Notifications
        <Badge className="ml-2" variant="secondary">
          {mockNotifications.length}
        </Badge>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Alerts</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>

          <div className="space-y-3 p-4 text-sm">
            {mockNotifications.map((item) => (
              <div key={item.id} className="rounded-md border px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.title}</span>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
