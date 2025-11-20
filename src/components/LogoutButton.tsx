import { clearAuth } from "../lib/storage";

export default function LogoutButton() {
  function handleLogout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 hover:underline"
    >
      Logout
    </button>
  );
}
