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
          type: "Submitted to Merchant Growth via Google Sheet",
          createdAt: "2024-01-01T12:00:00Z",
          detail: "Submitted to Merchant Growth via Google Sheet"
        }
      ]
    },
    isLoading: false,
    error: null
  })
}));

describe("AuditTimelineTab", () => {
  it("renders submission events in the timeline", async () => {
    renderWithProviders(<AuditTimelineTab />);

    expect(await screen.findByText("Submitted to Merchant Growth via Google Sheet")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01T12:00:00Z")).toBeInTheDocument();
  });
});
