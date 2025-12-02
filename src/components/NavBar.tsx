import NotificationBell from "./notifications/NotificationBell";
import TopBarUserMenu from "./layout/TopBarUserMenu";

export default function NavBar() {
  return (
    <div className="bf-topbar">
      <div className="bf-topbar-left">Boreal Staff Portal</div>

      <div className="bf-topbar-right">
        <NotificationBell />
        <TopBarUserMenu />
      </div>
    </div>
  );
}
