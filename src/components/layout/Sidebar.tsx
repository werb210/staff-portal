import { NavLink } from "react-router-dom";
import { Home, Users, Building2, Briefcase } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Briefcase },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 font-semibold text-lg">
        Boreal Staff
      </div>

      <nav className="flex flex-col mt-4 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isActive ? "bg-gray-200 text-black" : "text-gray-600"
              }`
            }
          >
            <Icon className="h-4 w-4 mr-3" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
