import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

const SLFTabApplication = ({ applicationId }: { applicationId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["slf", "application", applicationId],
    queryFn: () => apiClient.get(`/api/slf/applications/${applicationId}`)
  });

  if (isLoading) {
    return <div>Loading application data...</div>;
  }

  const application = data?.data ?? {};

  return (
    <div className="slf-application-view">
      <h3>Business Info</h3>
      <pre>{JSON.stringify(application.businessInfo ?? {}, null, 2)}</pre>
      <h3>Applicant Info</h3>
      <pre>{JSON.stringify(application.applicantInfo ?? {}, null, 2)}</pre>
      <h3>Funding Request</h3>
      <pre>{JSON.stringify(application.fundingRequest ?? {}, null, 2)}</pre>
      <h3>Financial Snapshot</h3>
      <pre>{JSON.stringify(application.financialSnapshot ?? {}, null, 2)}</pre>
      <h3>Contact</h3>
      <pre>{JSON.stringify(application.contact ?? {}, null, 2)}</pre>
    </div>
  );
};

export default SLFTabApplication;
