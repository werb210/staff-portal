import RequireRole from "@/components/auth/RequireRole";
import SettingsSectionLayout from "./components/SettingsSectionLayout";
import SettingsOverview from "./tabs/SettingsOverview";

const SettingsPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <SettingsSectionLayout>
      <SettingsOverview />
    </SettingsSectionLayout>
  </RequireRole>
);

export default SettingsPage;
