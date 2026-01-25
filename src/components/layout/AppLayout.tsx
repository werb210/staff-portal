import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ApiStatusBanner from "./ApiStatusBanner";
import ApiErrorToast from "./ApiErrorToast";
import "@/styles/globals.css";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-shell ${sidebarOpen ? "app-shell--menu-open" : ""}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell__content">
        <ApiStatusBanner />
        <ApiErrorToast />
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
