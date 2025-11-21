import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="font-medium text-gray-700">Staff Portal</div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">{user?.email}</span>

        <button
          onClick={logout}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
