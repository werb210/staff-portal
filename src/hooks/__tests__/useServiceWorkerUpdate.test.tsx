// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import UpdatePromptBanner from "@/components/UpdatePromptBanner";

describe("useServiceWorkerUpdate", () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, "location", { value: originalLocation, configurable: true });
    window.sessionStorage.clear();
  });

  it("guards against repeated reloads on controller changes", () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadSpy },
      configurable: true
    });

    const serviceWorker = new EventTarget();
    Object.defineProperty(navigator, "serviceWorker", {
      value: serviceWorker,
      configurable: true
    });

    render(<UpdatePromptBanner />);

    serviceWorker.dispatchEvent(new Event("controllerchange"));
    serviceWorker.dispatchEvent(new Event("controllerchange"));

    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
