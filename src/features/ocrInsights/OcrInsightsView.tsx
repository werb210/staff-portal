import clsx from "clsx";
import type { OcrInsightsView as OcrInsightsData } from "@/hooks/useOCRInsights";
import { OCR_INSIGHTS_CATEGORIES, getOcrInsightsCategoryLabel } from "./ocrInsightsConfig";
import OcrInsightsMismatchTable from "./OcrInsightsMismatchTable";

interface OcrInsightsViewProps {
  data: OcrInsightsData;
}

const OcrInsightsView = ({ data }: OcrInsightsViewProps) => {
  const totalRows = Object.values(data.groupedByCategory).reduce((sum, rows) => sum + rows.length, 0);
  const hasMissing = data.missingRequiredFields.length > 0;
  const hasConflicts = data.mismatchRows.length > 0;

  return (
    <div className="ocr-insights__content">
      {(hasMissing || hasConflicts) && (
        <div className="ocr-insights__banners">
          {hasMissing && (
            <div className="ocr-insights__banner ocr-insights__banner--warning" role="status">
              Missing required OCR fields
            </div>
          )}
          {hasConflicts && (
            <div className="ocr-insights__banner ocr-insights__banner--conflict" role="status">
              Conflicting OCR values detected
            </div>
          )}
        </div>
      )}
      {hasMissing && (
        <div className="ocr-insights__missing">
          <div className="ocr-insights__missing-title">Required fields missing:</div>
          <div className="ocr-insights__missing-list">
            {data.missingRequiredFields.map((field) => (
              <span key={field} className="ocr-insights__missing-pill">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
      {totalRows === 0 ? (
        <div className="drawer-placeholder">No OCR fields extracted yet.</div>
      ) : (
        OCR_INSIGHTS_CATEGORIES.map((category) => {
          const rows = data.groupedByCategory[category.id] ?? [];
          const label = getOcrInsightsCategoryLabel(category.id);
          return (
            <section key={category.id} className="ocr-insights__section">
              <header className="ocr-insights__section-header">
                <h3>{label}</h3>
                <span className="ocr-insights__section-count">{rows.length} fields</span>
              </header>
              <div className="ocr-insights__table">
                <div className="ocr-insights__row ocr-insights__row--header">
                  <span>Field</span>
                  <span>Value</span>
                  <span>Source Document</span>
                </div>
                {rows.length === 0 ? (
                  <div className="ocr-insights__row ocr-insights__row--empty">
                    <span className="ocr-insights__empty">No fields captured.</span>
                  </div>
                ) : (
                  rows.map((row) => (
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
                  ))
                )}
              </div>
            </section>
          );
        })
      )}
      {hasConflicts ? <OcrInsightsMismatchTable rows={data.mismatchRows} /> : null}
    </div>
  );
};

export default OcrInsightsView;
