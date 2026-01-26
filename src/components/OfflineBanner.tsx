import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const OfflineBanner = () => {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      You’re offline — some features may be unavailable
    </div>
  );
};

export default OfflineBanner;
