import { NavLink } from "react-router-dom";
import { useAuthStore } from "../state/authStore";

export default function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);

  const baseItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "CRM", to: "/crm" },
    { label: "Pipeline", to: "/pipeline" },
  ];

  const adminOnly = [
    { label: "Users", to: "/admin/users" },
    { label: "Audit Logs", to: "/admin/audit" },
  ];

  const lenderOnly = [
    { label: "My Products", to: "/lender/products" },
    { label: "Reports", to: "/lender/reports" },
  ];

  const referrerOnly = [
    { label: "Referrals", to: "/referrer/referrals" },
    { label: "Performance", to: "/referrer/performance" },
  ];

  let items = baseItems;

  if (role === "admin") items = [...items, ...adminOnly];
  if (role === "lender") items = lenderOnly;
  if (role === "referrer") items = referrerOnly;

  return (
    <div className="w-64 bg-white border-r h-full overflow-y-auto">
      <div className="p-4 font-bold text-xl">Boreal Staff</div>

      <nav className="flex flex-col space-y-1 p-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-100 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
