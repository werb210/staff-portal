import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ApiStatusBanner from "./ApiStatusBanner";
import ApiErrorToast from "./ApiErrorToast";
import NotificationToast from "@/components/notifications/NotificationToast";
import { useNotificationPermissionPrompt } from "@/hooks/useNotificationPermissionPrompt";
import VoiceDialer from "@/components/dialer/VoiceDialer";
import "@/styles/globals.css";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useNotificationPermissionPrompt();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-shell ${sidebarOpen ? "app-shell--menu-open" : ""}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell__content">
        <ApiStatusBanner />
        <ApiErrorToast />
        <NotificationToast />
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      <VoiceDialer />
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
