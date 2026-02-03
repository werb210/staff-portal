import type { OcrMismatchRow } from "@/hooks/useOCRInsights";

interface OcrInsightsMismatchTableProps {
  rows: OcrMismatchRow[];
}

const OcrInsightsMismatchTable = ({ rows }: OcrInsightsMismatchTableProps) => (
  <section className="ocr-insights__mismatch">
    <header className="ocr-insights__section-header">
      <h3>Field-level mismatches</h3>
      <span className="ocr-insights__section-count">{rows.length} conflicts</span>
    </header>
    <div className="ocr-insights__mismatch-table">
      <div className="ocr-insights__mismatch-row ocr-insights__mismatch-row--header">
        <span>Field</span>
        <span>Document</span>
        <span>Value</span>
        <span>Conflicts With</span>
      </div>
      {rows.map((row) => (
        <div key={`${row.documentId}-${row.fieldKey}`} className="ocr-insights__mismatch-row">
          <span className="ocr-insights__field-label">{row.label}</span>
          <span className="ocr-insights__source">{row.documentName}</span>
          <span className="ocr-insights__value ocr-insights__value--conflict">{row.value}</span>
          <span className="ocr-insights__conflict-context">
            {row.comparisonValues.length > 0 ? row.comparisonValues.join(", ") : "—"}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default OcrInsightsMismatchTable;
