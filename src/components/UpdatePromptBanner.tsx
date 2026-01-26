import Button from "@/components/ui/Button";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

const UpdatePromptBanner = () => {
  const { updateAvailable, applyUpdate, dismiss } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="update-banner" role="status" aria-live="polite">
      <span>Update available. Refresh to get the latest changes.</span>
      <div className="update-banner__actions">
        <Button variant="secondary" onClick={() => void applyUpdate()}>
          Update now
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          Later
        </Button>
      </div>
    </div>
  );
};

export default UpdatePromptBanner;
