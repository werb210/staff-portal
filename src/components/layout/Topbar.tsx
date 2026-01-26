import { useAuth } from "@/hooks/useAuth";
import { useSilo } from "@/hooks/useSilo";
import { useSettingsStore } from "@/state/settings.store";
import { getRoleLabel } from "@/utils/roles";
import Button from "../ui/Button";
import SiloSelector from "./SiloSelector";
import PushNotificationCta from "@/components/PushNotificationCta";

type TopbarProps = {
  onToggleSidebar: () => void;
};

const Topbar = ({ onToggleSidebar }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { silo } = useSilo();
  const { branding } = useSettingsStore();

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
        <PushNotificationCta />
        {user && (
          <div className="topbar__user">
            <div>
              <div className="topbar__user-name">{user.name}</div>
              <div className="topbar__user-role">{getRoleLabel(user.role)}</div>
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
