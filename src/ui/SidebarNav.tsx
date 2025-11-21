import { NavLink } from "react-router-dom";
import { Home, Users, FileText, Search, Tag, LogOut } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/search", label: "Search", icon: Search },
  { to: "/tags", label: "Tags", icon: Tag },
  { to: "/users", label: "Users", icon: Users },
];

export default function SidebarNav() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="h-16 px-6 flex items-center text-xl font-semibold border-b">
        Boreal Staff
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm 
              ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-6 py-3 text-left text-red-600 hover:bg-red-50 border-t"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
