import { useAuth } from "../../lib/auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="font-medium text-gray-700">
        Welcome{user ? `, ${user.email}` : ""}
      </div>

      <button
        className="bg-red-600 text-white px-4 py-1 rounded"
        onClick={logout}
      >
        Logout
      </button>
    </header>
  );
}
