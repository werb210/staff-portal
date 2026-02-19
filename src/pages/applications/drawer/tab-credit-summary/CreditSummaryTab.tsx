import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCreditSummary, type CreditSummary } from "@/api/credit";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";
import { trackPortalEvent } from "@/lib/portalTracking";
import { useAuth } from "@/hooks/useAuth";

const CreditSummaryTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const trackedApplicationIdRef = useRef<string | null>(null);
  const { user } = useAuth();
  const { data: summary, isLoading, error } = useQuery<CreditSummary>({
    queryKey: ["credit", applicationId],
    queryFn: ({ signal }) => fetchCreditSummary(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  useEffect(() => {
    if (!applicationId || !summary) return;
    if (trackedApplicationIdRef.current === applicationId) return;
    const userId = (user as { id?: string | null } | null)?.id ?? "unknown";
    trackPortalEvent("staff_action", {
      user_id: userId,
      action_type: "credit_summary_generate",
      application_id: applicationId
    });
    trackPortalEvent("credit_summary_generated", {
      application_id: applicationId,
      user_id: userId
    });
    trackedApplicationIdRef.current = applicationId;
  }, [applicationId, summary, user]);

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view credit summary.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading credit summary…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load credit summary.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__credit">
      <div className="drawer-section">
        <div className="drawer-section__title">Business Overview</div>
        <div>{summary?.businessOverview ?? "—"}</div>
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Industry Overview</div>
        <div>{summary?.industryOverview ?? "—"}</div>
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Financial Overview</div>
        <div>{summary?.financialOverview ?? "—"}</div>
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Risk Assessment</div>
        <div>{summary?.riskAssessment ?? "—"}</div>
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Collateral Overview</div>
        <div>{summary?.collateralOverview ?? "—"}</div>
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Summary of Terms</div>
        <div>{summary?.termsSummary ?? "—"}</div>
      </div>
      {summary?.pdfUrl ? (
        <div className="drawer-footer-actions">
          <a className="btn btn--ghost" href={summary.pdfUrl} target="_blank" rel="noreferrer">
            Download PDF
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default CreditSummaryTab;
