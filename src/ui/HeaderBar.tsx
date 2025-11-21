import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function HeaderBar() {
  const { user, setUser } = useAuth();

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-3">
      <h1 className="text-lg font-semibold text-gray-800">Boreal Portal</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user?.email}</span>

        <button
          onClick={logout}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </button>
      </div>
    </header>
  );
}
