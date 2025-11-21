import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      className="text-red-500 hover:text-red-700 font-medium"
    >
      Logout
    </button>
  );
}
