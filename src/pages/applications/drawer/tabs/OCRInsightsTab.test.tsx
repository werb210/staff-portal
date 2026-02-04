import { render, screen } from "@testing-library/react";
import OCRInsightsTab from "@/pages/applications/drawer/tabs/OCRInsightsTab";

const mockUseOCRInsights = vi.fn();

vi.mock("@/hooks/useOCRInsights", () => ({
  useOCRInsights: () => mockUseOCRInsights()
}));

describe("OCRInsightsTab", () => {
  beforeEach(() => {
    mockUseOCRInsights.mockReset();
  });

  it("renders the OCR insights tab with conflicts highlighted", () => {
    mockUseOCRInsights.mockReturnValue({
      applicationId: "app-1",
      isLoading: false,
      error: null,
      data: {
        groupedByDocument: {
          "Bank Statements": {
            "balance-sheet": [
              {
                fieldKey: "bank_balance",
                label: "Bank Balance",
                value: "1,200",
                documentId: "doc-1",
                documentName: "January Statement",
                documentCategory: "balance-sheet",
                confidence: 0.91,
                conflict: true,
                comparisonValues: ["1,500"]
              }
            ]
          }
        },
        requiredFields: [
          { fieldKey: "bank_balance", label: "Bank Balance", present: true },
          { fieldKey: "tax_id", label: "Tax ID", present: false }
        ],
        conflictGroups: [
          {
            fieldKey: "bank_balance",
            label: "Bank Balance",
            values: [
              { documentId: "doc-1", documentName: "January Statement", value: "1,200" },
              { documentId: "doc-2", documentName: "February Statement", value: "1,500" }
            ]
          }
        ],
        totalRows: 1
      }
    });

    render(<OCRInsightsTab />);

    expect(screen.getByText("Required Fields Status")).toBeInTheDocument();
    expect(screen.getByText("Conflicting Fields")).toBeInTheDocument();
    const value = screen.getAllByText("1,200")[0];
    expect(value).toHaveClass("ocr-insights__value--conflict");
    expect(screen.getAllByText("January Statement").length).toBeGreaterThan(0);
  });

  it("shows missing required fields", () => {
    mockUseOCRInsights.mockReturnValue({
      applicationId: "app-2",
      isLoading: false,
      error: null,
      data: {
        groupedByDocument: {},
        requiredFields: [{ fieldKey: "tax_id", label: "Tax ID", present: false }],
        conflictGroups: [],
        totalRows: 0
      }
    });

    render(<OCRInsightsTab />);

    expect(screen.getByText("Tax ID")).toBeInTheDocument();
    expect(screen.getByText("Missing")).toBeInTheDocument();
  });

  it("handles empty OCR responses gracefully", () => {
    mockUseOCRInsights.mockReturnValue({
      applicationId: "app-3",
      isLoading: false,
      error: null,
      data: {
        groupedByDocument: {},
        requiredFields: [],
        conflictGroups: [],
        totalRows: 0
      }
    });

    render(<OCRInsightsTab />);

    expect(screen.getByText("No OCR fields extracted yet.")).toBeInTheDocument();
  });
});
