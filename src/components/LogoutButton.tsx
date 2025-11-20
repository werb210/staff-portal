import { useNavigate } from "react-router-dom";
import { logout } from "../lib/storage";

export default function LogoutButton() {
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:underline font-semibold"
    >
      Logout
    </button>
  );
}
