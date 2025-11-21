import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../lib/auth/useAuthStore";
import { Home, Users, Settings } from "lucide-react";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  const baseNav = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/clients", label: "Clients", icon: Users },
  ];

  const adminNav = [
    { to: "/admin", label: "Admin Panel", icon: Settings },
  ];

  const finalNav = user?.role === "admin" ? [...baseNav, ...adminNav] : baseNav;

  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col px-4 py-6">
      <h1 className="text-xl font-semibold mb-8">Boreal Staff</h1>

      <nav className="flex-1 space-y-2">
        {finalNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md 
               ${isActive ? "bg-gray-200 font-semibold" : "text-gray-700"}`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
