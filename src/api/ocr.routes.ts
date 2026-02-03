import type { OcrExtractionInput, OcrExtractionOutput } from "@/ocr/ocrExtractor";
import { getOcrResultsForApplication, runOcrExtraction } from "@/ocr/ocrExtractor";
import { compareOcrResults, type OcrComparisonResult } from "@/ocr/ocrComparator";
import type { OcrResultRecord } from "@/db/schema/ocrResults";

export type OcrInsightsResponse = OcrComparisonResult & {
  application_id: string;
  results: OcrResultRecord[];
};

export const extractDocumentOcr = (input: OcrExtractionInput): OcrExtractionOutput => runOcrExtraction(input);

export const fetchOcrInsights = async (applicationId: string): Promise<OcrInsightsResponse> => {
  const results = getOcrResultsForApplication(applicationId);
  const comparison = compareOcrResults(results);
  return {
    application_id: applicationId,
    results,
    ...comparison
  };
};
