import { NavLink } from "react-router-dom";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-64 bg-white shadow-xl p-6 flex flex-col space-y-6">
      <h2 className="text-xl font-bold">Staff Portal</h2>

      <nav className="flex-1 space-y-3">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            "block px-3 py-2 rounded-md " +
            (isActive
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200")
          }
        >
          Dashboard
        </NavLink>
      </nav>

      <button
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        onClick={onLogout}
      >
        Logout
      </button>
    </aside>
  );
}
