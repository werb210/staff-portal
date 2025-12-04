import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import NotificationBell from "../../src/components/nav/NotificationBell";

interface MenuItem {
  label: string;
  path: string;
  roles: string[];
}

const menu: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["admin", "staff", "lender", "referrer"] },
  { label: "Notifications", path: "/notifications", roles: ["admin", "staff", "lender", "referrer"] },
  { label: "CRM", path: "/crm", roles: ["admin", "staff"] },
  { label: "Pipeline", path: "/pipeline", roles: ["admin", "staff"] },

  // Admin
  { label: "Users", path: "/admin/users", roles: ["admin"] },
  { label: "Audit Logs", path: "/admin/audit", roles: ["admin"] },

  // Lender
  { label: "My Products", path: "/lender/products", roles: ["lender"] },
  { label: "Reports", path: "/lender/reports", roles: ["lender"] },

  // Referrer
  { label: "Referrals", path: "/referrer/referrals", roles: ["referrer"] },
  { label: "Performance", path: "/referrer/performance", roles: ["referrer"] },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const role = user?.role;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r overflow-y-auto">
        <div className="p-4 text-xl font-bold border-b">Boreal Staff</div>

        <nav className="p-4 space-y-2">
          {menu
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
              >
                {item.label}
              </Link>
            ))}

          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600 mt-6"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-end mb-4">
          <NotificationBell user={user} />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
