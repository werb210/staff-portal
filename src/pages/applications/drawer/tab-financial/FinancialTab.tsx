import { useQuery } from "@tanstack/react-query";
import { fetchOcrResults, type OcrSection, type OcrResults } from "@/api/ocr";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";

const SectionBlock = ({ section }: { section?: OcrSection }) => {
  if (!section) return null;
  const conflicts = section.conflicts ?? [];
  const hasConflicts = conflicts.length > 0;

  return (
    <div className={`drawer-section ${hasConflicts ? "drawer-section--warning" : ""}`}>
      <div className="drawer-section__title">{section.title}</div>
      <div className="drawer-section__body">
        <dl className="drawer-kv-list">
          {Object.entries(section.fields).map(([key, value]) => {
            const conflict = conflicts.find((c) => c.field === key);
            return (
              <div key={key} className={`drawer-kv-list__item ${conflict ? "drawer-kv-list__item--conflict" : ""}`}>
                <dt>{key}</dt>
                <dd>{String(value)}</dd>
                {conflict ? <div className="drawer-conflict">Conflicting values: {conflict.values.join(", ")}</div> : null}
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

const FinancialTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { data: results, isLoading, error } = useQuery<OcrResults>({
    queryKey: ["ocr", applicationId, "results"],
    queryFn: ({ signal }) => fetchOcrResults(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view financial data.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading financial data…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load financial data.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__financial">
      <SectionBlock section={results?.balanceSheet} />
      <SectionBlock section={results?.incomeStatement} />
      <SectionBlock section={results?.cashFlow} />
      <SectionBlock section={results?.taxItems} />
      <SectionBlock section={results?.contracts} />
      <SectionBlock section={results?.invoices} />
      <SectionBlock section={results?.required} />
      <div className="drawer-footer-actions">
        <button type="button" className="btn" disabled>
          View Document
        </button>
      </div>
    </div>
  );
};

export default FinancialTab;
