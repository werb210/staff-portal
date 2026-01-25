import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/state/settings.store";
import { getErrorMessage } from "@/utils/errors";

const BrandingSettings = () => {
  const { branding, fetchBranding, saveBranding, statusMessage, isLoadingBranding } = useSettingsStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [localBranding, setLocalBranding] = useState(branding);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setLocalBranding(branding);
  }, [branding]);

  const handleLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLocalBranding((prev) => ({ ...prev, logoUrl: previewUrl }));
  };

  const onSave = async () => {
    setFormError(null);
    try {
      await saveBranding(localBranding);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save branding settings."));
    }
  };

  const onLoadBranding = async () => {
    setFormError(null);
    try {
      await fetchBranding();
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to load branding settings."));
    }
  };

  const logoPreviewStyle = useMemo(
    () => ({
      width: `${localBranding.logoWidth}px`
    }),
    [localBranding.logoWidth]
  );

  return (
    <section className="settings-panel" aria-label="Branding settings">
      <header>
        <h2>Branding</h2>
        <p>Upload a logo and size it for the portal header, emails, PDFs, and client apps.</p>
      </header>
      {formError && <ErrorBanner message={formError} />}

      <div className="branding-preview">
        <div>
          <p className="ui-field__label">Logo preview</p>
          <div className="logo-preview__frame">
            <img
              src={localBranding.logoUrl}
              alt="Company logo preview"
              className="logo-preview"
              style={logoPreviewStyle}
            />
          </div>
        </div>
        <div className="branding-controls">
          <label className="ui-field">
            <span className="ui-field__label">Logo size</span>
            <input
              type="range"
              min={120}
              max={360}
              step={10}
              value={localBranding.logoWidth}
              onChange={(event) =>
                setLocalBranding((prev) => ({
                  ...prev,
                  logoWidth: Number(event.target.value)
                }))
              }
              disabled={!isAdmin}
              aria-label="Resize logo"
            />
          </label>
          {isAdmin && <input type="file" accept="image/*" onChange={handleLogo} aria-label="Upload logo" />}
          {!isAdmin && <p className="ui-field__helper">Admins can upload and resize the logo.</p>}
        </div>
      </div>

      <div className="settings-actions">
        <Button type="button" variant="secondary" onClick={onLoadBranding} disabled={isLoadingBranding}>
          {isLoadingBranding ? "Refreshing..." : "Refresh branding"}
        </Button>
        {isAdmin && (
          <Button type="button" onClick={onSave} disabled={isLoadingBranding}>
            {isLoadingBranding ? "Saving..." : "Save branding"}
          </Button>
        )}
        {statusMessage && <span role="status">{statusMessage}</span>}
      </div>
    </section>
  );
};

export default BrandingSettings;
