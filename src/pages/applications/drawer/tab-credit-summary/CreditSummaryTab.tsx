import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCreditSummary, regenerateCreditSummary, type CreditSummary } from "@/api/credit";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";

const CreditSummaryTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const queryClient = useQueryClient();
  const { data: summary, isLoading, error } = useQuery<CreditSummary>({
    queryKey: ["credit", applicationId],
    queryFn: ({ signal }) => fetchCreditSummary(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  const mutation = useMutation({
    mutationFn: () => regenerateCreditSummary(applicationId ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credit", applicationId] })
  });

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
      <div className="drawer-footer-actions">
        <button className="btn btn--primary" type="button" onClick={() => mutation.mutate()}>
          Regenerate Summary
        </button>
        {summary?.pdfUrl ? (
          <a className="btn btn--ghost" href={summary.pdfUrl} target="_blank" rel="noreferrer">
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default CreditSummaryTab;
