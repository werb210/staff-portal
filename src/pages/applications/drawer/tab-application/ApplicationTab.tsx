import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { fetchApplicationDetails } from "@/api/applications";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="drawer-section">
    <div className="drawer-section__title">{title}</div>
    <div className="drawer-section__body">{children}</div>
  </div>
);

const KeyValueList = ({ data }: { data?: Record<string, string | number | boolean> }) => {
  if (!data || Object.keys(data).length === 0) return <div className="drawer-placeholder">No data available.</div>;
  return (
    <dl className="drawer-kv-list">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="drawer-kv-list__item">
          <dt>{key}</dt>
          <dd>{typeof value === "string" && key.toLowerCase().includes("ssn") ? "***-**-****" : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
};

const ApplicationTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications", applicationId, "details"],
    queryFn: () => fetchApplicationDetails(applicationId ?? ""),
    enabled: Boolean(applicationId)
  });

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view details.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading application data…</div>;
  if (isError) return <div className="drawer-placeholder">Unable to load application data.</div>;

  const details = data?.data;

  return (
    <div className="drawer-tab drawer-tab__application">
      <Section title="KYC">
        <KeyValueList data={details?.kyc} />
      </Section>
      <Section title="Business Information">
        <KeyValueList data={details?.business} />
      </Section>
      <Section title="Applicant Information">
        <KeyValueList data={details?.applicantInfo} />
      </Section>
      <Section title="Owners">
        {details?.owners?.length ? (
          <div className="drawer-owner-list">
            {details.owners.map((owner, index) => (
              <KeyValueList key={index} data={owner} />
            ))}
          </div>
        ) : (
          <div className="drawer-placeholder">No owners provided.</div>
        )}
      </Section>
      <Section title="Funding Request">
        <KeyValueList data={details?.fundingRequest} />
      </Section>
      <Section title="Product Category">
        {details?.productCategory ? details.productCategory : <div className="drawer-placeholder">Not selected.</div>}
      </Section>
      <div className="drawer-footer-actions">
        <button type="button" className="btn" disabled>
          Edit
        </button>
      </div>
    </div>
  );
};

export default ApplicationTab;
