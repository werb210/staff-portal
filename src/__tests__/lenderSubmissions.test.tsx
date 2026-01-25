// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/testUtils";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import LendersTab from "@/pages/applications/drawer/tab-lenders/LendersTab";
import {
  createLenderSubmission,
  fetchLenderMatches,
  fetchLenderSubmissions,
  retryLenderTransmission
} from "@/api/lenders";
import { ApiError } from "@/lib/api";

vi.mock("@/api/lenders", () => ({
  fetchLenderMatches: vi.fn(),
  fetchLenderSubmissions: vi.fn(),
  createLenderSubmission: vi.fn(),
  retryLenderTransmission: vi.fn()
}));

const fetchLenderMatchesMock = vi.mocked(fetchLenderMatches);
const fetchLenderSubmissionsMock = vi.mocked(fetchLenderSubmissions);
const createLenderSubmissionMock = vi.mocked(createLenderSubmission);
const retryLenderTransmissionMock = vi.mocked(retryLenderTransmission);

describe("lender submissions tab", () => {
  beforeEach(() => {
    useApplicationDrawerStore.setState({
      isOpen: true,
      selectedApplicationId: "app-1",
      selectedTab: "lenders"
    });
    fetchLenderMatchesMock.mockReset();
    fetchLenderSubmissionsMock.mockReset();
    fetchLenderSubmissionsMock.mockResolvedValue([]);
    createLenderSubmissionMock.mockReset();
    retryLenderTransmissionMock.mockReset();
  });

  it("submits selected lender products and shows success state", async () => {
    fetchLenderMatchesMock.mockResolvedValueOnce([
      { id: "prod-1", lenderName: "Atlas Bank", productCategory: "SBA 7(a)" }
    ]);
    fetchLenderSubmissionsMock.mockResolvedValueOnce([]);

    let resolveSubmission: (() => void) | undefined;
    const submissionPromise = new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    });
    createLenderSubmissionMock.mockReturnValueOnce(submissionPromise);

    renderWithProviders(<LendersTab />);

    await waitFor(() => {
      expect(screen.getByText("Atlas Bank")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("checkbox"));
    const sendButton = screen.getByRole("button", { name: "Send to Lender" });
    await userEvent.click(sendButton);

    expect(createLenderSubmissionMock).toHaveBeenCalledWith("app-1", ["prod-1"]);
    expect(sendButton).toBeDisabled();

    resolveSubmission?.();

    await waitFor(() => {
      expect(screen.getByText("Submission sent successfully.")).toBeInTheDocument();
    });
  });

  it("surfaces submission failures with a retry action", async () => {
    fetchLenderMatchesMock.mockResolvedValueOnce([
      { id: "prod-2", lenderName: "Summit Capital", productCategory: "Term Loan" }
    ]);
    fetchLenderSubmissionsMock.mockResolvedValueOnce([]);
    createLenderSubmissionMock.mockRejectedValueOnce(
      new ApiError({ status: 500, message: "Server Error" })
    );

    renderWithProviders(<LendersTab />);

    await waitFor(() => {
      expect(screen.getByText("Summit Capital")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Send to Lender" }));

    await waitFor(() => {
      expect(screen.getByText("Submission failed due to a server error. Please retry.")).toBeInTheDocument();
    });

    createLenderSubmissionMock.mockResolvedValueOnce(undefined);
    await userEvent.click(screen.getByRole("button", { name: "Retry send" }));

    expect(createLenderSubmissionMock).toHaveBeenCalledTimes(2);
  });

  it("allows retry for failed transmissions", async () => {
    fetchLenderMatchesMock.mockResolvedValueOnce([
      { id: "prod-3", lenderName: "Canyon Funding", productCategory: "Bridge Loan" }
    ]);
    fetchLenderSubmissionsMock.mockResolvedValueOnce([
      { id: "sub-1", lenderProductId: "prod-3", status: "failed", transmissionId: "tx-99" }
    ]);

    renderWithProviders(<LendersTab />);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(retryLenderTransmissionMock).toHaveBeenCalledWith("tx-99");
  });

  it("enforces role-based visibility and read-only behavior", async () => {
    fetchLenderMatchesMock.mockResolvedValueOnce([
      { id: "prod-4", lenderName: "Beacon Lending", productCategory: "LOC" }
    ]);
    fetchLenderSubmissionsMock.mockResolvedValueOnce([]);

    renderWithProviders(<LendersTab />, { auth: { user: { id: "1", email: "lender@example.com", role: "Lender" } } });

    await waitFor(() => {
      expect(screen.getByText("Beacon Lending")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Send to Lender" })).toBeDisabled();
    expect(screen.getByText("Read-only access.")).toBeInTheDocument();
  });

  it("blocks referrer access entirely", async () => {
    fetchLenderMatchesMock.mockResolvedValueOnce([]);
    fetchLenderSubmissionsMock.mockResolvedValueOnce([]);

    renderWithProviders(<LendersTab />, { auth: { user: { id: "2", email: "ref@example.com", role: "Referrer" } } });

    await waitFor(() => {
      expect(screen.getByText("Access restricted")).toBeInTheDocument();
    });
  });

  it("renders submission statuses from the server", async () => {
    fetchLenderMatchesMock.mockResolvedValueOnce([
      { id: "prod-5", lenderName: "Summit", productCategory: "Line" },
      { id: "prod-6", lenderName: "Evergreen", productCategory: "Term" },
      { id: "prod-7", lenderName: "North Ridge", productCategory: "SBA" }
    ]);
    fetchLenderSubmissionsMock.mockResolvedValueOnce([
      { id: "sub-2", lenderProductId: "prod-5", status: "sent" },
      { id: "sub-3", lenderProductId: "prod-6", status: "pending_manual" },
      { id: "sub-4", lenderProductId: "prod-7", status: "failed" }
    ]);

    renderWithProviders(<LendersTab />);

    await waitFor(() => {
      expect(screen.getByText("Sent")).toBeInTheDocument();
      expect(screen.getByText("Pending manual")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });
});
