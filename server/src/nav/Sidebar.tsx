import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/contacts", label: "Contacts" },
  { to: "/companies", label: "Companies" },
  { to: "/deals", label: "Deals" },
  { to: "/applications", label: "Applications" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/documents", label: "Documents" },
  { to: "/lenders", label: "Lenders" },
  { to: "/marketing", label: "Marketing" },
  { to: "/referrals", label: "Referrals" },
  { to: "/admin/users", label: "Admin Users" },
  { to: "/admin/audit", label: "Audit Log" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-900 text-white p-4 space-y-2">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `block p-2 rounded ${isActive ? "bg-blue-600" : "hover:bg-gray-700"}`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}
