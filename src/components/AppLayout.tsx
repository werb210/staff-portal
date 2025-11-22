import { Outlet, Link, useLocation } from "react-router-dom";
import TopNav from "@/components/TopNav";

export default function AppLayout() {
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/contacts", label: "Contacts" },
    { to: "/companies", label: "Companies" },
    { to: "/deals", label: "Deals" },
    { to: "/search", label: "Search" },
    { to: "/applications", label: "Applications" },
    { to: "/pipeline", label: "Pipeline" }
  ];

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <aside className="w-56 bg-black text-white p-4 flex flex-col space-y-4">
        <h1 className="text-xl font-bold mb-4">Boreal Staff</h1>

        {navLinks.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={`block p-2 rounded ${
              pathname.startsWith(n.to)
                ? "bg-white text-black"
                : "hover:bg-gray-700"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
