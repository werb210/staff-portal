import { screen } from "@testing-library/react";
import PipelineCard from "./PipelineCard";
import type { PipelineApplication } from "./pipeline.types";
import { renderWithProviders } from "@/test/testUtils";

const baseCard: PipelineApplication = {
  id: "app-1",
  businessName: "Acme Co",
  contactName: "John Doe",
  requestedAmount: 50000,
  productCategory: "startup",
  stage: "RECEIVED",
  status: "New",
  documents: { submitted: 1, required: 3 },
  bankingComplete: false,
  ocrComplete: false,
  createdAt: new Date().toISOString()
};

describe("PipelineCard", () => {
  it("shows a warning badge when OCR fields are missing", () => {
    renderWithProviders(
      <PipelineCard
        card={{ ...baseCard, ocrMissingFields: ["business_name", "tax_id"] }}
        stageId="RECEIVED"
        stageLabel="Received"
        isTerminalStage={false}
        onClick={() => undefined}
      />
    );

    expect(screen.getByText("OCR_MISSING_FIELDS")).toBeInTheDocument();
  });
});
