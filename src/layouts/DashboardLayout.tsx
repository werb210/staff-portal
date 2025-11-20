import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/applications", label: "Applications" },
  { to: "/documents", label: "Documents" },
  { to: "/lenders", label: "Lenders" },
  { to: "/settings", label: "Settings" },
];

export default function DashboardLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="text-xl font-semibold">Staff Portal</div>
          <nav className="flex gap-4 text-sm font-medium">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded px-3 py-2 transition hover:bg-slate-100 ${
                    active ? "bg-slate-200" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
