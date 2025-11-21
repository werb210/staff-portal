import { useAuthStore } from "@/store/useAuthStore";

export default function Dashboard() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
