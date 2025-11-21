import { NavLink } from "react-router-dom";
import { NAV_ITEMS, filterByRole } from "@/config/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
  const role = useAuthStore((state) => state.user?.role ?? null);
  const links = filterByRole(role);

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
