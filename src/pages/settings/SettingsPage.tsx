import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import ProfileSettings from "./tabs/ProfileSettings";
import BrandingSettings from "./tabs/BrandingSettings";
import UserManagement from "./tabs/UserManagement";
import RuntimeSettings from "./tabs/RuntimeSettings";
import RequireRole from "@/components/auth/RequireRole";

const SettingsContent = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const tabs = useMemo(() => {
    const baseTabs = [
      { key: "profile", label: "Profile", component: <ProfileSettings /> },
      { key: "branding", label: "Branding", component: <BrandingSettings /> },
      { key: "runtime", label: "Runtime", component: <RuntimeSettings /> }
    ];

    if (isAdmin) {
      baseTabs.splice(1, 0, {
        key: "users",
        label: "User Management",
        component: <UserManagement />
      });
    }

    return baseTabs;
  }, [isAdmin]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.key ?? "profile");

  useEffect(() => {
    if (!tabs.find((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0]?.key ?? "profile");
    }
  }, [activeTab, tabs]);

  return (
    <div className="page settings-page">
      <Card title="Settings">
        <div className="settings-layout">
          <nav className="settings-tabs" aria-label="Settings navigation">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`settings-tab ${activeTab === tab.key ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                aria-current={activeTab === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="settings-content">
            {tabs.find((tab) => tab.key === activeTab)?.component ?? tabs[0]?.component}
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
