import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import RequireRole from "@/components/auth/RequireRole";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import SettingsSectionLayout from "./components/SettingsSectionLayout";
import BrandingSettings from "./tabs/BrandingSettings";
import ProfileSettings from "./tabs/ProfileSettings";
import RuntimeSettings from "./tabs/RuntimeSettings";
import UserManagement from "./tabs/UserManagement";

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const tabs = useMemo(
    () => [
      { id: "users", label: "User Management", visible: user?.role === "Admin", content: <UserManagement /> },
      { id: "profile", label: "My Profile", visible: true, content: <ProfileSettings /> },
      { id: "branding", label: "Branding", visible: true, content: <BrandingSettings /> },
      { id: "runtime", label: "Runtime Verification", visible: true, content: <RuntimeSettings /> }
    ],
    [user?.role]
  );

  const availableTabs = tabs.filter((tab) => tab.visible);
  const activeTabId = searchParams.get("tab");
  const fallbackTabId = availableTabs[0]?.id ?? "profile";
  const resolvedTabId = availableTabs.some((tab) => tab.id === activeTabId) ? activeTabId : fallbackTabId;
  const activeTab = availableTabs.find((tab) => tab.id === resolvedTabId) ?? availableTabs[0];

  useEffect(() => {
    if (resolvedTabId !== activeTabId) {
      setSearchParams({ tab: resolvedTabId });
    }
  }, [activeTabId, resolvedTabId, setSearchParams]);

  return (
    <RequireRole roles={["Admin", "Staff"]}>
      <ErrorBoundary>
        <SettingsSectionLayout>
          <div className="settings-layout">
            <div className="settings-tabs" role="tablist" aria-label="Settings tabs">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={tab.id === resolvedTabId}
                  className={`settings-tab ${tab.id === resolvedTabId ? "is-active" : ""}`}
                  onClick={() => setSearchParams({ tab: tab.id })}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="settings-content" role="tabpanel">
              <ErrorBoundary>{activeTab?.content}</ErrorBoundary>
            </div>
          </div>
        </SettingsSectionLayout>
      </ErrorBoundary>
    </RequireRole>
  );
};

export default SettingsPage;
