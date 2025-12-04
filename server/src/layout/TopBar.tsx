import { useAuthStore } from "@/state/authStore";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div
      style={{
        height: 50,
        background: "#ffffff",
        borderBottom: "1px solid #e1e1e1",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        justifyContent: "space-between"
      }}
    >
      <div>Staff Portal</div>

      <div>
        {user?.email} &nbsp;
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
