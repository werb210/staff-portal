import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import RequireRole from "@/components/auth/RequireRole";
import SettingsOverview from "./tabs/SettingsOverview";
import ProfileSettings from "./tabs/ProfileSettings";
import BrandingSettings from "./tabs/BrandingSettings";
import UserManagement from "./tabs/UserManagement";
import RuntimeSettings from "./tabs/RuntimeSettings";

const SettingsContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === "Admin";
  const tabs = useMemo(() => {
    const baseTabs = [
      { key: "settings", label: "Settings", path: "/settings", component: <SettingsOverview /> },
      { key: "profile", label: "My Profile", path: "/settings/profile", component: <ProfileSettings /> },
      { key: "branding", label: "Branding", path: "/settings/branding", component: <BrandingSettings /> },
      { key: "runtime", label: "Runtime Verification", path: "/settings/runtime", component: <RuntimeSettings /> }
    ];

    if (isAdmin) {
      baseTabs.splice(2, 0, {
        key: "users",
        label: "User Management",
        path: "/settings/users",
        component: (
          <RequireRole roles={["Admin"]}>
            <UserManagement />
          </RequireRole>
        )
      });
    }

    return baseTabs;
  }, [isAdmin]);

  const matchedTab = tabs.find((tab) => {
    if (tab.path === "/settings") {
      return location.pathname === tab.path;
    }
    return location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
  });
  const activeTab = matchedTab ?? tabs[0];

  useEffect(() => {
    if (!matchedTab && location.pathname !== tabs[0]?.path) {
      navigate(tabs[0]?.path ?? "/settings", { replace: true });
    }
  }, [location.pathname, matchedTab, navigate, tabs]);

  return (
    <div className="page settings-page">
      <Card title="Settings">
        <div className="settings-layout">
          <nav className="settings-tabs" aria-label="Settings navigation">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`settings-tab ${activeTab?.key === tab.key ? "is-active" : ""}`}
                onClick={() => navigate(tab.path)}
                aria-current={activeTab?.key === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="settings-content">
            {activeTab?.component ?? tabs[0]?.component}
          </div>
        </div>
      </Card>
    </div>
  );
};

const SettingsPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <SettingsContent />
  </RequireRole>
);

export default SettingsPage;
