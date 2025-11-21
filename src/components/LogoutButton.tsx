import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const nav = useNavigate();
  const { logout } = useAuth();

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
