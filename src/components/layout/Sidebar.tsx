import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Dashboard", to: "/" },
  { label: "Applications", to: "/applications" },
  { label: "Contacts", to: "/contacts" },
  { label: "Companies", to: "/companies" },
  { label: "Lenders", to: "/lenders" },
  { label: "Reports", to: "/reports" },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b font-semibold text-lg">
        Boreal Staff
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 text-xs text-gray-500 border-t">
        Logged in as: <span className="font-medium">{user?.email}</span>
      </div>
    </aside>
  );
}
