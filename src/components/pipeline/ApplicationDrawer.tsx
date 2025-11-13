// -------------------------------------------------------------
// ApplicationDrawer.tsx
// Fully aligned with Staff Backend Pipeline Drawer API.
// Shows Application Info, Documents, Lenders, AI Summary.
// -------------------------------------------------------------

import { useState } from "react";
import { Tabs, Tab } from "../common/Tabs";
import { Spinner } from "../common/Spinner";

import {
  usePipelineApplication,
  usePipelineDocuments,
  usePipelineLenders,
  usePipelineAISummary,
} from "../../hooks/usePipeline";

interface Props {
  applicationId: string;
}

export default function ApplicationDrawer({ applicationId }: Props) {
  const [tab, setTab] = useState("application");

  const applicationQuery = usePipelineApplication(applicationId);
  const documentsQuery = usePipelineDocuments(applicationId);
  const lendersQuery = usePipelineLenders(applicationId);
  const summaryQuery = usePipelineAISummary(applicationId);

  if (applicationQuery.isLoading) return <Spinner />;

  const app = applicationQuery.data;

  if (!app) return <p>Application not found.</p>;

  return (
    <div className="application-drawer">
      <header className="drawer-header">
        <h2>Application #{applicationId}</h2>
        <p>Applicant: {app?.application?.applicantName ?? "Unknown"}</p>
      </header>

      <Tabs active={tab} onChange={setTab}>
        <Tab id="application" label="Application" />
        <Tab id="documents" label="Documents" />
        <Tab id="lenders" label="Lenders" />
        <Tab id="summary" label="AI Summary" />
      </Tabs>

      <div className="drawer-body">
        {/* ---------------------- APPLICATION TAB ---------------------- */}
        {tab === "application" && (
          <div className="tab-section">
            <h3>Application Details</h3>
            <pre>{JSON.stringify(app.application, null, 2)}</pre>
          </div>
        )}

        {/* ---------------------- DOCUMENTS TAB ------------------------ */}
        {tab === "documents" && (
          <div className="tab-section">
            <h3>Documents</h3>

            {documentsQuery.isLoading && <Spinner />}

            {documentsQuery.data?.length === 0 && <p>No documents uploaded.</p>}

            {documentsQuery.data?.map((doc: any) => (
              <div key={doc.id} className="document-item">
                <strong>{doc.name}</strong>
                <p>Type: {doc.documentType}</p>
                <p>Status: {doc.status}</p>

                {doc.s3Url && (
                  <a
                    href={doc.s3Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ---------------------- LENDERS TAB -------------------------- */}
        {tab === "lenders" && (
          <div className="tab-section">
            <h3>Lender Matches</h3>

            {lendersQuery.isLoading && <Spinner />}

            {lendersQuery.data?.map((lender: any) => (
              <div key={lender.id} className="lender-item">
                <h4>{lender.name}</h4>
                <p>Country: {lender.country}</p>
                <p>Category: {lender.productCategory}</p>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------- AI SUMMARY TAB ------------------------ */}
        {tab === "summary" && (
          <div className="tab-section">
            <h3>AI Summary</h3>

            {summaryQuery.isLoading && <Spinner />}

            {!summaryQuery.data && (
              <p>No AI summary generated yet.</p>
            )}

            {summaryQuery.data && (
              <pre>{JSON.stringify(summaryQuery.data, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
