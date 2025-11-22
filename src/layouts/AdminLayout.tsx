import { Fragment } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuthStore } from "../core/auth.store";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Pipeline", to: "/pipeline" },
  { label: "Contacts", to: "/contacts" },
  { label: "Companies", to: "/companies" },
  { label: "Deals", to: "/deals" },
  { label: "Applications", to: "/applications" },
  { label: "Documents", to: "/documents" },
  { label: "Search", to: "/search" },
  { label: "Tags", to: "/tags" },
  { label: "Marketing", to: "/marketing" },
  { label: "Analytics", to: "/analytics" },
  { label: "Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
];

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    const label = part
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
    return { label, href };
  });

  return [{ label: "Dashboard", href: "/dashboard" }, ...crumbs];
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role ?? "Staff");
  const breadcrumbs = buildBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/90 px-4 py-6 backdrop-blur lg:flex">
          <div className="mb-6 flex items-center justify-between px-2">
            <Link to="/dashboard" className="text-lg font-bold tracking-tight text-indigo-700">
              Staff Portal
            </Link>
            <Badge variant="outline">v1.0</Badge>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700 ${
                    isActive ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100" : "text-slate-700"
                  }`
                }
                end={item.to === "/dashboard"}
              >
                <span className="h-2 w-2 rounded-full bg-indigo-500/60" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-700">
                  SP
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Staff Portal</p>
                  <p className="text-sm font-medium text-slate-700">Unified layout system</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <Input type="search" placeholder="Search portal" className="w-64" />
                </div>
                <Badge variant="success">Role: {role}</Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-6">
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                  <Link
                    to={crumb.href}
                    className="text-sm font-medium text-slate-700 transition hover:text-indigo-700"
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 ? (
                    <span className="text-slate-400" aria-hidden>
                      /
                    </span>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
