import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
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
