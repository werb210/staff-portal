import { describe, expect, it } from "vitest";
import { type AiKnowledgeDocument } from "@/services/aiService";

describe("product sheet upload statuses", () => {
  it("supports upload, OCR and embedding status fields", () => {
    const record: AiKnowledgeDocument = {
      id: "doc-1",
      name: "product-sheet.pdf",
      category: "Product",
      isActive: true,
      status: "Processing",
      uploadStatus: "Uploaded",
      ocrStatus: "Processed",
      embeddingStatus: "Pending",
      chunkCount: 0,
      lastIndexedAt: null
    };

    expect(record.uploadStatus).toBe("Uploaded");
    expect(record.ocrStatus).toBe("Processed");
    expect(record.embeddingStatus).toBe("Pending");
  });
});
