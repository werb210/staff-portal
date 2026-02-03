import { useMemo } from "react";
import { useOCRInsights } from "@/hooks/useOCRInsights";
import { getErrorMessage } from "@/utils/errors";
import { useDocumentReliabilityToast } from "./useDocumentReliabilityToast";

const DocumentReliabilityPanel = () => {
  const { applicationId, isLoading, error, data } = useOCRInsights();

  const conflictFields = useMemo(
    () => Array.from(new Set(data.mismatchRows.map((row) => row.label))),
    [data.mismatchRows]
  );

  useDocumentReliabilityToast({
    applicationId,
    missingFields: data.missingRequiredFields,
    conflictFields
  });

  if (!applicationId) return null;

  if (isLoading) {
    return <div className="document-reliability document-reliability--loading">Loading document reliability…</div>;
  }

  if (error) {
    return (
      <div className="document-reliability document-reliability--error">
        {getErrorMessage(error, "Unable to load document reliability warnings.")}
      </div>
    );
  }

  const hasIssues = data.missingRequiredFields.length > 0 || conflictFields.length > 0;

  return (
    <section className="document-reliability" aria-live="polite">
      <header className="document-reliability__header">
        <h3>Document Reliability</h3>
        <span className={hasIssues ? "document-reliability__status" : "document-reliability__status document-reliability__status--ok"}>
          {hasIssues ? "Review needed" : "No issues detected"}
        </span>
      </header>
      {hasIssues ? (
        <div className="document-reliability__body">
          {data.missingRequiredFields.length > 0 && (
            <div className="document-reliability__section">
              <div className="document-reliability__label">Missing required OCR fields</div>
              <div className="document-reliability__tags">
                {data.missingRequiredFields.map((field) => (
                  <span key={field} className="document-reliability__tag document-reliability__tag--warning">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
          {conflictFields.length > 0 && (
            <div className="document-reliability__section">
              <div className="document-reliability__label">Conflicting OCR values</div>
              <div className="document-reliability__tags">
                {conflictFields.map((field) => (
                  <span key={field} className="document-reliability__tag document-reliability__tag--alert">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="document-reliability__empty">OCR fields are consistent across documents.</div>
      )}
    </section>
  );
};

export default DocumentReliabilityPanel;
