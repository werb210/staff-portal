import { useAuthStore } from "@/lib/auth/useAuthStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">Welcome {user?.email}</h1>
      <p className="text-gray-600 mt-2">Dashboard will go here.</p>
    </div>
  );
}
