import { Link, useLocation } from "react-router-dom";
import { Home, Users, FileText, Search, Settings } from "lucide-react";

const nav = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Applications", to: "/applications", icon: FileText },
  { label: "Search", to: "/search", icon: Search },
  { label: "Users", to: "/users", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow-md border-r">
      <div className="p-4 text-xl font-bold text-blue-600">Boreal Staff</div>

      <nav className="mt-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
