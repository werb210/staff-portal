import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";
import { DetailSection } from "@/pages/applications/ApplicationDetails";
import { getErrorMessage } from "@/utils/errors";

const BusinessDetailsTab = () => {
  const { applicationId, data: details, isLoading, error } = useApplicationDetails();

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view business details.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading business details…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load business details.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__business">
      <DetailSection title="Business Details" data={details?.businessDetails ?? details?.business ?? null} />
      <DetailSection title="Ownership & Operators" data={details?.owners ?? null} />
    </div>
  );
};

export default BusinessDetailsTab;
