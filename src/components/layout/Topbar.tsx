import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSilo } from "@/hooks/useSilo";
import { useSettingsStore } from "@/state/settings.store";
import { useNotificationsStore } from "@/state/notifications.store";
import { getRoleLabel, resolveUserRole } from "@/utils/roles";
import { useDialerStore } from "@/state/dialer.store";
import Button from "../ui/Button";
import SiloSelector from "./SiloSelector";
import PushNotificationCta from "@/components/PushNotificationCta";
import NotificationCenter from "@/components/notifications/NotificationCenter";

type TopbarProps = {
  onToggleSidebar: () => void;
};

const Topbar = ({ onToggleSidebar }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { silo } = useSilo();
  const { branding } = useSettingsStore();
  const unreadCount = useNotificationsStore(
    (state) => state.notifications.filter((item) => !item.read).length
  );
  const openDialer = useDialerStore((state) => state.openDialer);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu-button"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
        >
          ☰
        </button>
        {branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt="Company logo"
            className="topbar__logo"
            style={{ maxWidth: `${branding.logoWidth}px` }}
          />
        )}
        <div className="topbar__title-stack">
          <h1 className="topbar__title">Staff Portal</h1>
          <span className="topbar__subtitle">Silo: {silo}</span>
        </div>
      </div>
      <div className="topbar__right">
        <SiloSelector />
        <button
          type="button"
          className="topbar__icon-button"
          aria-label="Open dialer"
          onClick={() => openDialer({ source: "global" })}
        >
          ☎︎
        </button>
        <div className="relative">
          <button
            type="button"
            className="relative rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:border-slate-300"
            aria-label="Open notifications"
            onClick={() => setIsCenterOpen((prev) => !prev)}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {isCenterOpen && <NotificationCenter onClose={() => setIsCenterOpen(false)} />}
        </div>
        <PushNotificationCta />
        {user && (
          <div className="topbar__user">
            <div>
              <div className="topbar__user-name">{user.name}</div>
              <div className="topbar__user-role">
                {getRoleLabel(resolveUserRole((user as { role?: string | null } | null)?.role ?? null))}
              </div>
            </div>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
