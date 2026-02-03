import { useMemo } from "react";
import clsx from "clsx";
import { useOCRInsights } from "@/hooks/useOCRInsights";
import { getErrorMessage } from "@/utils/errors";

const OCRInsightsTab = () => {
  const { applicationId, isLoading, error, data } = useOCRInsights();

  const categoryEntries = useMemo(() => Object.entries(data.groupedByCategory), [data.groupedByCategory]);

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view OCR insights.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading OCR insights…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load OCR insights.")}</div>;

  return (
    <div className="drawer-tab ocr-insights">
      {data.missingRequiredFields.length > 0 ? (
        <div className="ocr-insights__banner" role="status">
          Missing OCR fields: {data.missingRequiredFields.join(", ")}
        </div>
      ) : null}
      {categoryEntries.length === 0 ? (
        <div className="drawer-placeholder">No OCR fields extracted yet.</div>
      ) : (
        categoryEntries.map(([category, rows]) => (
          <section key={category} className="ocr-insights__section">
            <header className="ocr-insights__section-header">
              <h3>{category}</h3>
              <span className="ocr-insights__section-count">{rows.length} fields</span>
            </header>
            <div className="ocr-insights__table">
              <div className="ocr-insights__row ocr-insights__row--header">
                <span>Field</span>
                <span>Value</span>
                <span>Source Document</span>
              </div>
              {rows.map((row) => (
                <div key={`${row.documentId}-${row.fieldKey}`} className="ocr-insights__row">
                  <span className="ocr-insights__field-label">{row.label}</span>
                  <span
                    className={clsx("ocr-insights__value", {
                      "ocr-insights__value--conflict": row.conflict
                    })}
                  >
                    {row.value}
                    {row.conflict ? <span className="ocr-insights__conflict-badge">Conflict</span> : null}
                    {row.conflict && row.comparisonValues.length > 0 ? (
                      <span className="ocr-insights__conflict-context">
                        Conflicts with: {row.comparisonValues.join(", ")}
                      </span>
                    ) : null}
                  </span>
                  <span className="ocr-insights__source">{row.documentName}</span>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default OCRInsightsTab;
