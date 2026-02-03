import { useOCRInsights } from "@/hooks/useOCRInsights";
import { getErrorMessage } from "@/utils/errors";
import OcrInsightsView from "@/features/ocrInsights/OcrInsightsView";

const OCRInsightsTab = () => {
  const { applicationId, isLoading, error, data } = useOCRInsights();

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view OCR insights.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading OCR insights…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load OCR insights.")}</div>;

  return (
    <div className="drawer-tab ocr-insights">
      <OcrInsightsView data={data} />
    </div>
  );
};

export default OCRInsightsTab;
