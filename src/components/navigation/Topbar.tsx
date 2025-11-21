import { useMemo, useState } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationsPanel from "./notifications/NotificationsPanel";
import SearchModal from "./search/SearchModal";
import { useAuthStore } from "@/store/useAuthStore";

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const initials = useMemo(() => user?.name?.slice(0, 2).toUpperCase() ?? "US", [user]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen((o) => !o)} aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Avatar initials={initials} />
          <div className="hidden text-left text-sm sm:block">
            <p className="font-medium leading-none">{user?.name ?? "Guest"}</p>
            <p className="text-xs text-muted-foreground">{user?.role ?? "unauthenticated"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAuth();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </header>
  );
}
