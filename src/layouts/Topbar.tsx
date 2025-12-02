import { useAuthStore } from "../state/authStore";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="w-full h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="text-lg font-semibold">Welcome</div>

      <div className="flex items-center gap-4">
        <span className="text-gray-700">{user?.email}</span>

        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
