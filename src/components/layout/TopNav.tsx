import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import { useNavStore } from "@/store/navStore";

export default function TopNav() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const toggleNav = useNavStore((s) => s.toggle);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md border px-2 py-1 text-sm font-semibold md:hidden"
          onClick={toggleNav}
        >
          Menu
        </button>
        <h1 className="text-xl font-semibold">Staff Portal</h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <span className="text-sm text-gray-600">{user?.role}</span>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-gray-300 text-gray-700"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
