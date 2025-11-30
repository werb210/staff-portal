import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/state/authStore";

export default function Layout() {
  const { logout } = useAuthStore();
  const location = useLocation();

  const nav = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Contacts", path: "/contacts" },
    { label: "Companies", path: "/companies" },
    { label: "Deals", path: "/deals" },
    { label: "Pipeline", path: "/pipeline" },
    { label: "Applications", path: "/applications" }
  ];

  return (
    <div className="w-full h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r p-4 space-y-3">
        <h1 className="text-xl font-semibold mb-6">Boreal Staff</h1>

        {nav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              "block p-2 rounded " +
              (location.pathname.startsWith(item.path)
                ? "bg-black text-white"
                : "hover:bg-gray-200")
            }
          >
            {item.label}
          </Link>
        ))}

        <button
          onClick={logout}
          className="mt-8 p-2 bg-red-500 text-white w-full rounded"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
