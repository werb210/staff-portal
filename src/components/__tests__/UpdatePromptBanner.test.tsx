import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UpdatePromptBanner from "@/components/UpdatePromptBanner";

const buildRegistration = () => {
  const postMessage = vi.fn();
  return {
    waiting: { postMessage },
    update: vi.fn()
  } as unknown as ServiceWorkerRegistration;
};

describe("UpdatePromptBanner", () => {
  it("renders when a service worker update is available", async () => {
    const registration = buildRegistration();
    render(<UpdatePromptBanner />);

    window.dispatchEvent(new CustomEvent("sw:update", { detail: { registration } }));

    expect(await screen.findByText(/Update available/i)).toBeInTheDocument();
    const updateButton = screen.getByRole("button", { name: /Update now/i });
    await userEvent.click(updateButton);

    expect(registration.waiting?.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });
});
