import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import ProfileSettings from "./tabs/ProfileSettings";
import SecuritySettings from "./tabs/SecuritySettings";
import MeetingLinks from "./tabs/MeetingLinks";
import CommunicationSettings from "./tabs/CommunicationSettings";
import SiloSettings from "./tabs/SiloSettings";
import BrandingSettings from "./tabs/BrandingSettings";
import RequireRole from "@/components/auth/RequireRole";

const SettingsContent = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const tabs = useMemo(
    () => [
      { key: "profile", label: "Profile", component: <ProfileSettings /> },
      { key: "security", label: "Security", component: <SecuritySettings /> },
      { key: "meeting", label: "Meeting Links", component: <MeetingLinks /> },
      { key: "communication", label: "Communication", component: <CommunicationSettings /> },
      { key: "silo", label: "Silo", component: <SiloSettings /> },
      { key: "branding", label: "Branding", component: <BrandingSettings /> }
    ],
    [isAdmin]
  );

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.key ?? "profile");

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
            {!isAdmin && (
              <div className="settings-tab settings-tab--disabled" aria-label="Admin tabs hidden">
                Admin features unavailable
              </div>
            )}
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
