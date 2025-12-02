import { useAuthStore } from "../state/authStore";
import NotificationBell from "./notifications/NotificationBell";

export default function NavBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div
      style={{
        width: "100%",
        height: "60px",
        background: "#1b2533",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: 20 }}>Boreal Staff Portal</div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <NotificationBell />
        {user && (
          <div style={{ fontSize: 14 }}>
            {user.email} — {user.role}
          </div>
        )}

        <button
          style={{
            background: "#d9534f",
            color: "white",
            padding: "6px 14px",
            borderRadius: 4,
            cursor: "pointer",
            border: "none",
          }}
          onClick={() => logout()}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
