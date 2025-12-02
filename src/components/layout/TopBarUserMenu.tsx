import { useAuthStore } from "../../state/authStore";

export default function TopBarUserMenu() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="bf-user-menu">
      <div className="bf-user-info">
        <span className="bf-user-name">{user.email}</span>
        <span className="bf-user-role">{user.role.toUpperCase()}</span>
      </div>
      <button className="bf-logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
