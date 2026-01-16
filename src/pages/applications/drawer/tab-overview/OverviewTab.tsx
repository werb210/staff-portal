import { useMemo } from "react";
import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";
import { DetailSection } from "@/pages/applications/ApplicationDetails";
import { getErrorMessage } from "@/utils/errors";

const OverviewTab = () => {
  const { applicationId, data: details, isLoading, error } = useApplicationDetails();

  const overviewData = useMemo(() => {
    if (!details) return null;
    if (details.overview) return details.overview;
    return {
      applicant: details.applicant,
      status: details.status,
      submittedAt: details.submittedAt,
      stage: details.stage,
      productCategory: details.productCategory
    };
  }, [details]);

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view details.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading application overview…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load application overview.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__overview">
      <DetailSection title="Overview" data={overviewData} />
      <DetailSection title="Application Payload" data={details?.rawPayload ?? null} />
    </div>
  );
};

export default OverviewTab;
