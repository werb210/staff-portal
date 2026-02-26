// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OverviewTab from "@/pages/applications/drawer/tab-overview/OverviewTab";
import ApplicantDetailsTab from "@/pages/applications/drawer/tab-applicant/ApplicantDetailsTab";
import DocumentsTab from "@/pages/applications/drawer/tab-documents/DocumentsTab";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { fetchApplicationDetails } from "@/api/applications";
import { acceptDocument, fetchDocumentRequirements, rejectDocument } from "@/api/documents";

vi.mock("@/api/applications", () => ({
  fetchApplicationDetails: vi.fn()
}));

vi.mock("@/api/documents", () => ({
  fetchDocumentRequirements: vi.fn(),
  acceptDocument: vi.fn(),
  rejectDocument: vi.fn()
}));

const fetchApplicationDetailsMock = vi.mocked(fetchApplicationDetails);
const fetchDocumentRequirementsMock = vi.mocked(fetchDocumentRequirements);
const acceptDocumentMock = vi.mocked(acceptDocument);
const rejectDocumentMock = vi.mocked(rejectDocument);

describe("application visibility requirements", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({
      isOpen: true,
      selectedApplicationId: "app-1",
      selectedTab: "application"
    });
    fetchApplicationDetailsMock.mockReset();
    fetchDocumentRequirementsMock.mockReset();
    acceptDocumentMock.mockReset();
    rejectDocumentMock.mockReset();
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

  it("renders documents grouped by category with required labels", async () => {
    fetchDocumentRequirementsMock.mockResolvedValue([
      { id: "doc-1", name: "Bank Statement", status: "uploaded", category: "Financials", required: true },
      { id: "doc-2", name: "Driver License", status: "uploaded", category: "Identity", required: false }
    ]);

    renderWithProviders(<DocumentsTab />);

    await waitFor(() => {
      expect(screen.getByTestId("documents-category-financials")).toBeInTheDocument();
      expect(screen.getByTestId("documents-category-identity")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Required").length).toBeGreaterThan(0);
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("accepts documents via the accept endpoint and updates the UI", async () => {
    fetchDocumentRequirementsMock
      .mockResolvedValueOnce([
        { id: "doc-1", name: "Bank Statement", status: "uploaded", category: "Financials", required: true }
      ])
      .mockResolvedValueOnce([
        { id: "doc-1", name: "Bank Statement", status: "accepted", category: "Financials", required: true }
      ]);
    acceptDocumentMock.mockResolvedValueOnce({});

    renderWithProviders(<DocumentsTab />);

    await waitFor(() => {
      expect(screen.getAllByText("Bank Statement")[0]).toBeInTheDocument();
    });

    await userEvent.click(await screen.findByRole("button", { name: "Accept" }));
    const modal = await screen.findByRole("dialog");
    await userEvent.click(within(modal).getByRole("button", { name: "Accept" }));

    await waitFor(() => {
      expect(acceptDocumentMock).toHaveBeenCalledWith("doc-1");
      expect(screen.getByText("Accepted")).toBeInTheDocument();
    });
  });

  it("requires a rejection reason before submitting", async () => {
    fetchDocumentRequirementsMock.mockResolvedValue([
      { id: "doc-1", name: "Bank Statement", status: "uploaded", category: "Financials", required: true }
    ]);

    renderWithProviders(<DocumentsTab />);

    await waitFor(() => {
      expect(screen.getAllByText("Bank Statement")[0]).toBeInTheDocument();
    });

    await userEvent.click(await screen.findByRole("button", { name: "Reject" }));
    const modal = await screen.findByRole("dialog");
    await userEvent.click(within(modal).getByRole("button", { name: "Reject" }));

    expect(await screen.findByText("Rejection reason is required.")).toBeInTheDocument();
    expect(rejectDocumentMock).not.toHaveBeenCalled();
  });

  it("rejects documents and refreshes application details for stage updates", async () => {
    fetchDocumentRequirementsMock.mockResolvedValue([
      { id: "doc-1", name: "Bank Statement", status: "uploaded", category: "Financials", required: true }
    ]);
    rejectDocumentMock.mockResolvedValueOnce({});

    const { queryClient } = renderWithProviders(<DocumentsTab />);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await waitFor(() => {
      expect(screen.getAllByText("Bank Statement")[0]).toBeInTheDocument();
    });

    await userEvent.click(await screen.findByRole("button", { name: "Reject" }));
    const modal = await screen.findByRole("dialog");
    await userEvent.type(within(modal).getByLabelText("Rejection reason"), "Missing pages");
    await userEvent.click(within(modal).getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(rejectDocumentMock).toHaveBeenCalledWith("doc-1", "Missing pages");
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["applications", "app-1", "details"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["pipeline"] });
    });
  });

  it("does not render download actions", async () => {
    fetchDocumentRequirementsMock.mockResolvedValue([
      { id: "doc-1", name: "Bank Statement", status: "uploaded", category: "Financials", required: true }
    ]);

    renderWithProviders(<DocumentsTab />);

    await waitFor(() => {
      expect(screen.getAllByText("Bank Statement")[0]).toBeInTheDocument();
    });

    expect(screen.queryByText("Download")).not.toBeInTheDocument();
  });
});
