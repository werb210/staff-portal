import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/state/settings.store";

const BrandingSettings = () => {
  const { branding, uploadFavicon, uploadLogo, statusMessage } = useSettingsStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const handleFavicon = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    uploadFavicon(previewUrl);
  };

  const handleLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    uploadLogo(previewUrl);
  };

  return (
    <section className="settings-panel" aria-label="Branding settings">
      <header>
        <h2>Branding</h2>
        <p>Upload a logo to keep branding consistent across the portal, emails, PDFs, and client apps.</p>
      </header>

      <div className="branding-preview">
        <div>
          <p className="ui-field__label">Favicon</p>
          <img src={branding.faviconUrl} alt="Current favicon" className="favicon-preview" />
          {isAdmin && <input type="file" accept="image/*" onChange={handleFavicon} aria-label="Upload favicon" />}
        </div>
        <div>
          <p className="ui-field__label">Logo</p>
          <img src={branding.logoUrl} alt="Company logo" className="logo-preview" />
          {isAdmin && <input type="file" accept="image/*" onChange={handleLogo} aria-label="Upload logo" />}
        </div>
      </div>

      <div className="branding-usage">
        <p className="ui-field__label">Logo usage</p>
        <ul>
          <li>Portal header</li>
          <li>Email templates</li>
          <li>PDF exports</li>
          <li>Client app (if configured)</li>
        </ul>
      </div>

      <div className="palette">
        <p className="ui-field__label">Color palette</p>
        <div className="palette-swatches">
          {branding.palette.map((color) => (
            <span key={color} className="swatch" style={{ background: color }} aria-label={color} />
          ))}
        </div>
      </div>

      <div className="typography">
        <p className="ui-field__label">Typography</p>
        <ul>
          {branding.typography.map((font) => (
            <li key={font}>{font}</li>
          ))}
        </ul>
      </div>

      <div className="settings-actions">
        <a className="ui-button" href={branding.brandKitUrl} target="_blank" rel="noreferrer">
          Download Brand Kit
        </a>
        {statusMessage && <span role="status">{statusMessage}</span>}
      </div>
    </section>
  );
};

export default BrandingSettings;
