import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore, type SiloCode, type SiloPermissions } from "@/state/settings.store";

const permissionLabels: Record<keyof SiloPermissions, string> = {
  canViewApplications: "Applications",
  canViewCRM: "CRM",
  canUseDialer: "Dialer",
  canUseMarketing: "Marketing",
  canSendToLenders: "Send to Lenders"
};

const SiloSettings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { silos, setDefaultSilo, updateSiloPermission, statusMessage } = useSettingsStore();

  const togglePermission = (code: SiloCode, key: keyof SiloPermissions, value: boolean) => {
    updateSiloPermission(code, key, value);
  };

  return (
    <section className="settings-panel" aria-label="Silo settings">
      <header>
        <h2>Silo preferences</h2>
        <p>Choose your default silo and review permissions.</p>
      </header>

      <Select
        label="Default silo"
        value={silos.defaultSilo}
        onChange={(e) => setDefaultSilo(e.target.value as SiloCode)}
        options={silos.allowed.map((code) => ({ value: code, label: code }))}
      />

      <div className="settings-card">
        <h3>Allowed silos</h3>
        <p>{silos.allowed.join(", ")}</p>
      </div>

      <div className="permissions-grid">
        {silos.access.map((silo) => (
          <div key={silo.code} className="settings-card" aria-label={`${silo.name} permissions`}>
            <h4>{silo.name}</h4>
            <ul>
              {Object.entries(permissionLabels).map(([key, label]) => {
                const permissionKey = key as keyof SiloPermissions;
                const value = silo.permissions[permissionKey];
                return (
                  <li key={key} className="permission-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={value}
                        disabled={!isAdmin}
                        onChange={(e) => togglePermission(silo.code, permissionKey, e.target.checked)}
                      />
                      {label}
                    </label>
                  </li>
                );
              })}
            </ul>
            {!isAdmin && <p className="muted">Permissions are view-only for your role.</p>}
          </div>
        ))}
      </div>

      {statusMessage && <div role="status">{statusMessage}</div>}
    </section>
  );
};

export default SiloSettings;
