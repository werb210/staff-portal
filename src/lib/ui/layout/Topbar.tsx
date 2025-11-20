import { useAuth } from "../../auth/AuthContext";

export const Topbar = ({ onMenu }: { onMenu?: () => void }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white shadow flex items-center justify-between px-4 md:ml-64">
      <button
        onClick={onMenu}
        className="md:hidden p-2 rounded border border-gray-300"
      >
        ☰
      </button>

      <div className="font-medium">Welcome, {user?.email}</div>

      <button
        onClick={logout}
        className="text-sm px-3 py-1 bg-black text-white rounded"
      >
        Logout
      </button>
    </header>
  );
};
