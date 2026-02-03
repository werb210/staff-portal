// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuditTimelineTab from "@/pages/applications/drawer/tab-audit/AuditTimelineTab";
import { renderWithProviders } from "@/test/testUtils";

vi.mock("@/api/applications", () => ({
  fetchApplicationAudit: vi.fn().mockResolvedValue([])
}));

vi.mock("@/pages/applications/hooks/useApplicationDetails", () => ({
  useApplicationDetails: () => ({
    applicationId: "app-1",
    data: {
      auditTimeline: [
        {
          id: "evt-1",
          type: "submission_google_sheet",
          createdAt: "2024-01-01T12:00:00Z",
          detail: "Submitted via sheet"
        },
        {
          id: "evt-2",
          type: "submission_failed",
          createdAt: "2024-01-02T12:00:00Z",
          detail: "Failed"
        },
        {
          id: "evt-3",
          type: "submission_retry",
          createdAt: "2024-01-03T12:00:00Z",
          detail: "Retried"
        }
      ]
    },
    isLoading: false,
    error: null
  })
}));

describe("audit timeline submissions", () => {
  it("renders submission audit labels", async () => {
    renderWithProviders(<AuditTimelineTab />);

    expect(await screen.findByText("Application submitted to lender (Google Sheet)")).toBeInTheDocument();
    expect(screen.getByText("Submission failed — retry required")).toBeInTheDocument();
    expect(screen.getByText("Submission retried successfully")).toBeInTheDocument();
  });
});
