import { useApiStatusStore } from "@/state/apiStatus";

const ApiStatusBanner = () => {
  const status = useApiStatusStore((state) => state.status);

  if (status !== "unavailable") return null;

  return (
    <div className="api-status-banner" role="status">
      <strong>Server unavailable.</strong> Some data may be out of date. Please retry in a moment.
    </div>
  );
};

export default ApiStatusBanner;
