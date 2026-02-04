import type { OcrInsightsView as OcrInsightsData } from "@/hooks/useOCRInsights";
import { getOcrInsightsCategoryLabel } from "./ocrInsightsConfig";
import clsx from "clsx";

interface OcrInsightsViewProps {
  data: OcrInsightsData;
}

const OcrInsightsView = ({ data }: OcrInsightsViewProps) => {
  const totalRows = data.totalRows;
  const hasMissing = data.requiredFields.some((field) => !field.present);
  const hasConflicts = data.conflictGroups.length > 0;
  const documentEntries = Object.entries(data.groupedByDocument).sort(([left], [right]) => left.localeCompare(right));

  return (
    <div className="ocr-insights__content">
      <section className="ocr-insights__section">
        <header className="ocr-insights__section-header">
          <h3>Required Fields Status</h3>
          <span className="ocr-insights__section-count">{data.requiredFields.length} fields</span>
        </header>
        <div className="ocr-insights__status-list">
          {data.requiredFields.map((field) => (
            <div
              key={field.fieldKey}
              className={clsx("ocr-insights__status-item", {
                "ocr-insights__status-item--present": field.present,
                "ocr-insights__status-item--missing": !field.present
              })}
            >
              <span className="ocr-insights__status-icon" aria-hidden="true">
                {field.present ? "✅" : "⚠️"}
              </span>
              <span className="ocr-insights__field-label">{field.label}</span>
              <span className="ocr-insights__status-text">{field.present ? "Present" : "Missing"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ocr-insights__section">
        <header className="ocr-insights__section-header">
          <h3>Conflicting Fields</h3>
          <span className="ocr-insights__section-count">{data.conflictGroups.length} conflicts</span>
        </header>
        {hasConflicts ? (
          <div className="ocr-insights__conflict-table">
            <div className="ocr-insights__conflict-row ocr-insights__conflict-row--header">
              <span>Field</span>
              <span>Values</span>
            </div>
            {data.conflictGroups.map((group) => (
              <div key={group.fieldKey} className="ocr-insights__conflict-row">
                <span className="ocr-insights__field-label">{group.label}</span>
                <div className="ocr-insights__conflict-values">
                  {group.values.map((value) => (
                    <div key={`${value.documentId}-${value.value}`} className="ocr-insights__conflict-value">
                      <span className="ocr-insights__conflict-value-doc">{value.documentName}</span>
                      <span className="ocr-insights__value ocr-insights__value--conflict">{value.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="drawer-placeholder">No conflicting fields detected.</div>
        )}
      </section>

      <section className="ocr-insights__section">
        <header className="ocr-insights__section-header">
          <h3>All Extracted Fields</h3>
          <span className="ocr-insights__section-count">{totalRows} fields</span>
        </header>
        {totalRows === 0 ? (
          <div className="drawer-placeholder">No OCR fields extracted yet.</div>
        ) : (
          <div className="ocr-insights__document-list">
            {documentEntries.map(([documentType, categories]) => (
              <div key={documentType} className="ocr-insights__document-group">
                <div className="ocr-insights__document-title">{documentType}</div>
                {Object.entries(categories)
                  .sort(([left], [right]) => left.localeCompare(right))
                  .map(([categoryId, rows]) => (
                    <div key={categoryId} className="ocr-insights__category-group">
                      <div className="ocr-insights__category-title">{getOcrInsightsCategoryLabel(categoryId)}</div>
                      <div className="ocr-insights__table">
                        <div className="ocr-insights__row ocr-insights__row--header">
                          <span>Field</span>
                          <span>Value</span>
                          <span>Source Document</span>
                          <span>Confidence</span>
                        </div>
                        {rows.map((row) => (
                          <div key={`${row.documentId}-${row.fieldKey}-${row.value}`} className="ocr-insights__row">
                            <span className="ocr-insights__field-label">{row.label}</span>
                            <span
                              className={clsx("ocr-insights__value", {
                                "ocr-insights__value--conflict": row.conflict
                              })}
                            >
                              {row.value}
                            </span>
                            <span className="ocr-insights__source">{row.documentName}</span>
                            <span className="ocr-insights__confidence">
                              {row.confidence !== undefined ? row.confidence : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OcrInsightsView;
