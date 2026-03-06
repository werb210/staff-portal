import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/testUtils";
import ApplicationDetail from "@/pages/application/ApplicationDetail";

const mocks = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({}),
  get: vi.fn().mockResolvedValue([])
}));

vi.mock("@/api/httpClient", () => ({
  apiClient: { post: mocks.post, get: mocks.get }
}));

describe("ApplicationDetail", () => {
  it("submits document rejection", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("Missing statements");
    renderWithProviders(<ApplicationDetail applicationId="app-1" />);
    await userEvent.click(screen.getByRole("button", { name: "Documents" }));
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    await waitFor(() =>
      expect(mocks.post).toHaveBeenCalledWith(
        "/api/applications/app-1/documents/review",
        expect.objectContaining({ status: "rejected" })
      )
    );
  });

  it("sends chat message", async () => {
    renderWithProviders(<ApplicationDetail applicationId="app-1" />);
    await userEvent.click(screen.getByRole("button", { name: "Notes" }));
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), "hello");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith("/messages", { applicationId: "app-1", body: "hello" }));
  });
});
