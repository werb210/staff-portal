// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/testUtils";
import { screen, waitFor } from "@testing-library/react";
import IssueInboxPage from "@/pages/IssueInboxPage";
import { deleteIssue, fetchWebsiteIssues, resolveIssue } from "@/api/issues";

vi.mock("@/api/issues", () => ({
  fetchWebsiteIssues: vi.fn(),
  resolveIssue: vi.fn(),
  deleteIssue: vi.fn()
}));

describe("IssueInboxPage", () => {
  it("loads issue screenshots and allows resolve/delete", async () => {
    vi.mocked(fetchWebsiteIssues).mockResolvedValue([
      {
        id: "issue-1",
        message: "Upload failed",
        screenshotUrl: "/secure/issues/image-1.png",
        sessionId: "session-123",
        createdAt: "2025-01-01T00:00:00.000Z"
      }
    ]);
    vi.mocked(resolveIssue).mockResolvedValue({});
    vi.mocked(deleteIssue).mockResolvedValue(undefined);

    renderWithProviders(<IssueInboxPage />);

    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Issue screenshot" })).toHaveAttribute("src", "/secure/issues/image-1.png");
    expect(screen.getByText(/session-123/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Mark resolved" }));
    await waitFor(() => expect(resolveIssue).toHaveBeenCalledWith("issue-1"));
    expect(screen.getByRole("button", { name: "Resolved" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(deleteIssue).toHaveBeenCalledWith("issue-1"));
    await waitFor(() => expect(screen.queryByText("Upload failed")).not.toBeInTheDocument());
  });
});
