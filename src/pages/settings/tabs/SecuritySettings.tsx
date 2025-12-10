import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSettingsStore } from "@/state/settings.store";

const SecuritySettings = () => {
  const { security, changePassword, toggleTwoFactor, statusMessage } = useSettingsStore();
  const [passwords, setPasswords] = useState({ current: "", next: "" });

  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault();
    changePassword();
    setPasswords({ current: "", next: "" });
  };

  return (
    <section className="settings-panel" aria-label="Security settings">
      <header>
        <h2>Security</h2>
        <p>Manage password and two-factor authentication.</p>
      </header>

      <form className="settings-grid" onSubmit={handlePasswordChange}>
        <Input
          label="Current password"
          type="password"
          value={passwords.current}
          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          required
        />
        <Input
          label="New password"
          type="password"
          value={passwords.next}
          onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
          required
        />
        <div className="settings-actions">
          <Button type="submit">Change password</Button>
          {security.lastPasswordChange && (
            <span>Last changed: {new Date(security.lastPasswordChange).toLocaleString()}</span>
          )}
        </div>
      </form>

      <div className="settings-card">
        <div>
          <h3>Two-factor authentication</h3>
          <p>Email-based 2FA for your account.</p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={security.twoFactorEnabled}
            onChange={(e) => toggleTwoFactor(e.target.checked)}
          />
          <span>{security.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>

      <div className="settings-card">
        <h3>Recent logins</h3>
        <ul className="login-history">
          {security.loginHistory.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.timestamp}</strong> — {entry.location}
            </li>
          ))}
        </ul>
      </div>

      {statusMessage && <div role="status">{statusMessage}</div>}
    </section>
  );
};

export default SecuritySettings;
