// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OverviewTab from "@/pages/applications/drawer/tab-overview/OverviewTab";
import ApplicantDetailsTab from "@/pages/applications/drawer/tab-applicant/ApplicantDetailsTab";
import DocumentsTab from "@/pages/applications/drawer/tab-documents/DocumentsTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchApplicationDetails } from "@/api/applications";
import { fetchDocumentPresign, fetchDocumentRequirements, fetchDocumentVersions, updateDocumentStatus } from "@/api/documents";

vi.mock("@/api/applications", () => ({
  fetchApplicationDetails: vi.fn()
}));

vi.mock("@/api/documents", () => ({
  fetchDocumentPresign: vi.fn(),
  fetchDocumentRequirements: vi.fn(),
  updateDocumentStatus: vi.fn(),
  fetchDocumentVersions: vi.fn()
}));

const fetchApplicationDetailsMock = vi.mocked(fetchApplicationDetails);
const fetchDocumentRequirementsMock = vi.mocked(fetchDocumentRequirements);
const fetchDocumentPresignMock = vi.mocked(fetchDocumentPresign);
const fetchDocumentVersionsMock = vi.mocked(fetchDocumentVersions);
const updateDocumentStatusMock = vi.mocked(updateDocumentStatus);

describe("application visibility requirements", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({
      isOpen: true,
      selectedApplicationId: "app-1",
      selectedTab: "application"
    });
    fetchApplicationDetailsMock.mockReset();
    fetchDocumentRequirementsMock.mockReset();
    fetchDocumentPresignMock.mockReset();
    fetchDocumentVersionsMock.mockReset();
    updateDocumentStatusMock.mockReset();
  });

  it("renders full overview payload data", async () => {
    fetchApplicationDetailsMock.mockResolvedValueOnce({
      id: "app-1",
      applicant: "Taylor Applicant",
      status: "Received",
      submittedAt: "2024-02-01T10:00:00Z",
      overview: { applicant: "Taylor Applicant", status: "Received", stage: "Received" },
      rawPayload: { businessName: "Atlas Bakery", employees: 12 }
    });

    renderWithProviders(<OverviewTab />);

    await waitFor(() => {
      expect(screen.getByText("Taylor Applicant")).toBeInTheDocument();
      expect(screen.getByText("Atlas Bakery")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  it("labels missing applicant fields without crashing", async () => {
    fetchApplicationDetailsMock.mockResolvedValueOnce({
      id: "app-1"
    });

    renderWithProviders(<ApplicantDetailsTab />);

    await waitFor(() => {
      expect(screen.getAllByText("Not provided.").length).toBeGreaterThan(0);
    });
  });

  it("propagates document status updates", async () => {
    fetchDocumentRequirementsMock.mockResolvedValue([
      { id: "doc-1", name: "Bank Statement", status: "uploaded", version: 2 }
    ]);
    fetchDocumentPresignMock.mockResolvedValueOnce({ url: "https://example.com/doc.pdf", expiresAt: "soon" });
    fetchDocumentVersionsMock.mockResolvedValueOnce([]);
    updateDocumentStatusMock.mockResolvedValueOnce({});

    const { queryClient } = renderWithProviders(<DocumentsTab />);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await waitFor(() => {
      expect(screen.getAllByText("Bank Statement").length).toBeGreaterThan(0);
    });

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(updateDocumentStatusMock).toHaveBeenCalledWith("doc-1", "approved");
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["applications", "app-1", "documents"] });
    });
  });
});
