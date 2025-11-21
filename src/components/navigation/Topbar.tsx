import { useMemo, useState } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationsPanel from "./notifications/NotificationsPanel";
import SearchModal from "./search/SearchModal";
import { authStore } from "@/lib/auth/authStore";

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);

  const initials = useMemo(() => (user?.email ?? "User").slice(0, 2).toUpperCase(), [user]);

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
            <p className="font-medium leading-none">{user?.email ?? "Guest"}</p>
            <p className="text-xs text-muted-foreground">{user?.role ?? "unauthenticated"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
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
