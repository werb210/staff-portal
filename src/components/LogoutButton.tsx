import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";

export default function LogoutButton() {
  const nav = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    nav("/login");
  }

  return (
    <button onClick={handleLogout} className="text-red-600 hover:underline font-semibold">
      Logout
    </button>
  );
}
