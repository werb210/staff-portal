import { NavLink } from "react-router-dom";
import { Briefcase, Building2, Home, Search, Tag, Users, Workflow } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Briefcase },
  { to: "/pipeline", label: "Pipeline", icon: Workflow },
  { to: "/tags", label: "Tags", icon: Tag },
  { to: "/search", label: "Search", icon: Search },
];

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-6 text-lg font-semibold">Boreal Staff</div>

      <nav className="mt-4 flex flex-col space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                isActive ? "bg-gray-200 text-black" : "text-gray-600"
              }`
            }
          >
            <Icon className="mr-3 h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
