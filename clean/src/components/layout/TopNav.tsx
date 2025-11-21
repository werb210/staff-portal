import { Button } from "../ui/button";
import { authStore } from "../../lib/auth/authStore";

export default function TopNav() {
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="text-xl font-semibold text-gray-900">Staff Portal</div>

      <div className="flex items-center gap-4">
        {user?.role && <span className="text-sm text-gray-600">{user.role}</span>}
        <Button variant="outline" onClick={handleLogout} className="border-gray-300 text-gray-700">
          Logout
        </Button>
      </div>
    </header>
  );
}
