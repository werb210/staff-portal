import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">Welcome {user?.email}</h1>
      <p className="text-gray-600 mt-2">Dashboard will go here.</p>
    </div>
  );
}
