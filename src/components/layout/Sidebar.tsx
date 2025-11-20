import { NavLink } from "react-router-dom";
import { Home, Users, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r h-full flex flex-col">
      <div className="p-6 font-bold text-xl tracking-tight">Boreal Staff</div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 ${
              isActive ? "bg-gray-100 font-semibold" : "text-gray-700"
            }`
          }
        >
          <Home size={18} /> Dashboard
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 ${
              isActive ? "bg-gray-100 font-semibold" : "text-gray-700"
            }`
          }
        >
          <Users size={18} /> Contacts
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 ${
              isActive ? "bg-gray-100 font-semibold" : "text-gray-700"
            }`
          }
        >
          <Settings size={18} /> Settings
        </NavLink>
      </nav>
    </aside>
  );
}
