import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";

export default function LogoutButton() {
  const nav = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    nav("/login");
  }

  return (
    <button onClick={handleLogout} className="text-red-600 hover:underline font-semibold">
      Logout
    </button>
  );
}
