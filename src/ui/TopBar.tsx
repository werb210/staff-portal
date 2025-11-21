import { useAuth } from "../providers/AuthProvider";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center px-6 justify-between">
      <div className="font-medium text-gray-700">Boreal Financial — Staff Portal</div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.email || "Unknown User"}
        </span>
      </div>
    </header>
  );
}
