import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { fetchApplicationDetails } from "@/api/applications";
import type { ApplicationDetails } from "@/types/application.types";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="drawer-section">
    <div className="drawer-section__title">{title}</div>
    <div className="drawer-section__body">{children}</div>
  </div>
);

const KeyValueList = ({ data }: { data?: Record<string, unknown> | null }) => {
  if (!data || Object.keys(data).length === 0) return <div className="drawer-placeholder">No data available.</div>;
  return (
    <dl className="drawer-kv-list">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="drawer-kv-list__item">
          <dt>{key}</dt>
          <dd>
            {typeof value === "string" && key.toLowerCase().includes("ssn")
              ? "***-**-****"
              : typeof value === "string" || typeof value === "number" || typeof value === "boolean"
                ? String(value)
                : value == null
                  ? ""
                  : JSON.stringify(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const ApplicationTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { data: details, isLoading, error } = useQuery<ApplicationDetails>({
    queryKey: ["applications", applicationId, "details"],
    queryFn: ({ signal }) => fetchApplicationDetails(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view details.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading application data…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load application data.")}</div>;

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
