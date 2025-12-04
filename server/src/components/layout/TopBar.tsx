import { useAuthStore } from "@/state/authStore";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="bf-topbar">
      <div className="bf-topbar-left">
        <span className="bf-topbar-title">Boreal Staff Portal</span>
      </div>
      <div className="bf-topbar-right">
        {user && (
          <>
            <span className="bf-topbar-user">
              {user.email} ({user.role})
            </span>
            <button className="bf-topbar-logout" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
