import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/state/settings.store";

const CommunicationSettings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { silos, refreshEmailSync, statusMessage } = useSettingsStore();

  return (
    <section className="settings-panel" aria-label="Communication settings">
      <header>
        <h2>Communication channels</h2>
        <p>Dialer numbers and Office 365 sync status for each silo.</p>
      </header>

      <div className="silo-communication">
        {silos.access.map((silo) => (
          <div key={silo.code} className="settings-card" aria-label={`${silo.name} communication`}>
            <header className="settings-card__header">
              <div>
                <h3>{silo.name}</h3>
                <p>Phone: {silo.phoneNumber}</p>
              </div>
              <span className={`pill pill--${silo.emailSync.toLowerCase()}`}>
                Email Sync: {silo.emailSync}
              </span>
            </header>
            {isAdmin && (
              <Button type="button" onClick={() => refreshEmailSync(silo.code)}>
                Refresh O365 Token
              </Button>
            )}
          </div>
        ))}
      </div>

      {statusMessage && <div role="status">{statusMessage}</div>}
    </section>
  );
};

export default CommunicationSettings;
