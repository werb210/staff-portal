// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentsTab from "@/pages/applications/drawer/tab-documents/DocumentsTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchDocumentRequirements } from "@/api/documents";
import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";

vi.mock("@/api/documents", () => ({
  fetchDocumentRequirements: vi.fn(),
  acceptDocument: vi.fn(),
  rejectDocument: vi.fn()
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "Staff" } })
}));

vi.mock("@/pages/applications/hooks/useApplicationDetails", () => ({
  useApplicationDetails: vi.fn()
}));

describe("DocumentsTab OCR status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows processing when OCR is pending", async () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-1", selectedTab: "documents" });
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: "app-1",
      data: { id: "app-1", ocr_completed_at: null }
    } as unknown as ReturnType<typeof useApplicationDetails>);
    vi.mocked(fetchDocumentRequirements).mockResolvedValue([]);

    renderWithProviders(<DocumentsTab />);

    expect(await screen.findByText("Processing…")).toBeInTheDocument();
  });

  it("shows completed when OCR is finished", async () => {
    useApplicationDrawerStore.setState({ isOpen: true, selectedApplicationId: "app-2", selectedTab: "documents" });
    vi.mocked(useApplicationDetails).mockReturnValue({
      applicationId: "app-2",
      data: { id: "app-2", ocr_completed_at: "2025-07-10T12:00:00Z" }
    } as unknown as ReturnType<typeof useApplicationDetails>);
    vi.mocked(fetchDocumentRequirements).mockResolvedValue([]);

    renderWithProviders(<DocumentsTab />);

    expect(await screen.findByText("Completed")).toBeInTheDocument();
  });
});
