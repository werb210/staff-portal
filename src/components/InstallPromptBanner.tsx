import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import Button from "@/components/ui/Button";

const InstallPromptBanner = () => {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div className="install-banner" role="status" aria-live="polite">
      <span>Install the Staff Portal for faster access and offline support.</span>
      <div className="install-banner__actions">
        <Button variant="secondary" onClick={() => void promptInstall()}>
          Install App
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
