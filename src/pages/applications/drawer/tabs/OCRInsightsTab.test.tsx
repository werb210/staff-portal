import { render, screen } from "@testing-library/react";
import OCRInsightsTab from "@/pages/applications/drawer/tabs/OCRInsightsTab";

vi.mock("@/hooks/useOCRInsights", () => ({
  useOCRInsights: () => ({
    applicationId: "app-1",
    isLoading: false,
    error: null,
    data: {
      groupedByCategory: {
        "balance-sheet": [
          {
            fieldKey: "bank_balance",
            label: "Bank Balance",
            value: "1,200",
            documentId: "doc-1",
            documentName: "January Statement",
            documentCategory: "balance-sheet",
            conflict: true,
            comparisonValues: ["1,500"]
          }
        ]
      },
      missingRequiredFields: [],
      mismatches: [],
      mismatchRows: []
    }
  })
}));

describe("OCRInsightsTab", () => {
  it("renders conflicting fields in red", () => {
    render(<OCRInsightsTab />);

    const value = screen.getByText("1,200");
    expect(value).toHaveClass("ocr-insights__value--conflict");
    expect(screen.getByText("Conflict")).toBeInTheDocument();
  });
});
