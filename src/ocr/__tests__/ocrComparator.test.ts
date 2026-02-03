import { describe, expect, it } from "vitest";
import { compareOcrResults } from "@/ocr/ocrComparator";
import type { OcrResultRecord } from "@/db/schema/ocrResults";

const baseRecord = (overrides: Partial<OcrResultRecord>): OcrResultRecord => ({
  application_id: "app-1",
  document_id: "doc-1",
  field_key: "requested_amount",
  extracted_value: "1000",
  confidence: 0.9,
  source_page: 1,
  extracted_at: "2024-01-01T00:00:00Z",
  run_id: "run-1",
  version: 1,
  ...overrides
});

describe("compareOcrResults", () => {
  it("respects numeric tolerance for comparisons", () => {
    const results = [
      baseRecord({ document_id: "doc-1", extracted_value: "10,000" }),
      baseRecord({ document_id: "doc-2", extracted_value: "10,050" })
    ];

    const comparison = compareOcrResults(results);

    expect(comparison.mismatch_flags).toHaveLength(0);
  });

  it("flags mismatched string values across documents", () => {
    const results = [
      baseRecord({ field_key: "business_name", extracted_value: "Acme Holdings", document_id: "doc-1" }),
      baseRecord({ field_key: "business_name", extracted_value: "Atlas Holdings", document_id: "doc-2" })
    ];

    const comparison = compareOcrResults(results);

    expect(comparison.mismatch_flags).toHaveLength(2);
    expect(comparison.mismatch_flags[0].field_key).toBe("business_name");
  });
});
