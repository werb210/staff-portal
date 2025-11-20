import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Contacts", path: "/contacts" },
  { label: "Applications", path: "/applications" },
  { label: "Documents", path: "/documents" },
  { label: "Lenders", path: "/lenders" },
  { label: "Reports", path: "/reports" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">Boreal Staff</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  "block px-4 py-2 rounded-md text-sm font-medium " +
                  (active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <div className="font-medium">Logged in as: {user?.email}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
