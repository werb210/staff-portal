import { useAuthStore } from "@/store/auth";

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <button onClick={() => logout()} className="text-sm text-red-500 hover:underline">
      Logout
    </button>
  );
}
