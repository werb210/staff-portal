import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";
import { DetailSection } from "@/pages/applications/ApplicationDetails";
import { getErrorMessage } from "@/utils/errors";

const FinancialProfileTab = () => {
  const { applicationId, data: details, isLoading, error } = useApplicationDetails();

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view financial profile.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading financial profile…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load financial profile.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__financial-profile">
      <DetailSection title="Financial Profile" data={details?.financialProfile ?? null} />
      <DetailSection title="Funding Request" data={details?.fundingRequest ?? null} />
    </div>
  );
};

export default FinancialProfileTab;
