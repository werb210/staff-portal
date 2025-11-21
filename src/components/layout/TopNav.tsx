import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { Button } from "@/components/ui/button";

export default function TopNav() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4">
      <h1 className="text-xl font-semibold">Staff Portal</h1>

      <div className="flex items-center gap-4">
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
