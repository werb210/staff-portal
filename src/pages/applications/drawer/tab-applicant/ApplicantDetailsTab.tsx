import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";
import { DetailSection } from "@/pages/applications/ApplicationDetails";
import { getErrorMessage } from "@/utils/errors";

const ApplicantDetailsTab = () => {
  const { applicationId, data: details, isLoading, error } = useApplicationDetails();

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view applicant details.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading applicant details…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load applicant details.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__applicant">
      <DetailSection title="Applicant Details" data={details?.applicantDetails ?? details?.applicantInfo ?? null} />
      <DetailSection title="KYC" data={details?.kyc ?? null} />
    </div>
  );
};

export default ApplicantDetailsTab;
