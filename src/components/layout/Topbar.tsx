import { useAuth } from "../../providers/AuthProvider";

export function Topbar() {
  const { logout, user } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="text-gray-700 font-medium">Welcome, {user?.firstName || "User"}</div>

      <button
        onClick={logout}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
