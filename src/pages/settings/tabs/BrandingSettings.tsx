import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/state/settings.store";

const BrandingSettings = () => {
  const { branding, uploadFavicon, statusMessage } = useSettingsStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const handleFavicon = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    uploadFavicon(previewUrl);
  };

  return (
    <section className="settings-panel" aria-label="Branding settings">
      <header>
        <h2>Branding</h2>
        <p>Preview favicon, logo, colors, and typography.</p>
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
        </div>
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
