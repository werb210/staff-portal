import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Contacts", path: "/crm/contacts" },
  { label: "Companies", path: "/crm/companies" },
  { label: "Deals", path: "/crm/deals" },
  { label: "Tasks", path: "/crm/tasks" },
  { label: "Activity", path: "/crm/activity" },
  { label: "Pipeline", path: "/pipeline" },
  { label: "Lenders", path: "/lenders" },
  { label: "Referrers", path: "/referrers" },
  { label: "Tools", path: "/tools/ocr" },
  { label: "Settings", path: "/settings" },
];

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 border-r border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">Staff Portal</h1>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "block rounded px-3 py-2 font-medium transition",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
              end={item.path === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
