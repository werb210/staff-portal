import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Staff Dashboard</h1>

        <div className="flex items-center gap-3">
          <span className="text-gray-600">{user?.email}</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-semibold text-lg mb-2">Welcome</h2>
          <p className="text-gray-700">
            You are authenticated and ready to start using the Staff Portal.
          </p>
        </div>
      </div>
    </div>
  );
}
