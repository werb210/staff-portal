import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

type NavItem = {
  label: string;
  path: string;
  roles: string[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", path: "/", roles: ["Admin", "Staff", "Lender", "Referrer"] },
  { label: "Applications", path: "/applications", roles: ["Admin", "Staff"] },
  { label: "Contacts", path: "/contacts", roles: ["Admin", "Staff"] },
  { label: "Lenders", path: "/lenders", roles: ["Admin"] },
  { label: "Reports", path: "/reports", roles: ["Admin", "Staff"] },
];

export const Sidebar = ({ className = "hidden md:flex" }: { className?: string }) => {
  const { user } = useAuth();

  return (
    <aside
      className={`w-64 bg-gray-900 text-white h-screen px-4 py-6 flex-col ${className}`}
    >
      <h1 className="text-xl font-bold mb-8">Boreal Staff</h1>

      <nav className="flex-1 space-y-1">
        {NAV.filter((i) => i.roles.includes(user?.role ?? ""))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};
