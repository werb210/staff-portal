// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import NotificationToast from "@/components/notifications/NotificationToast";
import { useNotificationsStore } from "@/state/notifications.store";
import { buildNotification } from "@/utils/notifications";

describe("in-app notification rendering", () => {
  beforeEach(() => {
    useNotificationsStore.setState({ notifications: [], toast: null });
  });

  it("renders a toast for new in-app notifications", () => {
    const notification = buildNotification(
      {
        title: "System alert",
        body: "Scheduled maintenance tonight.",
        type: "system_alert"
      },
      "in_app"
    );

    useNotificationsStore.getState().addNotification(notification);

    render(<NotificationToast />);

    expect(screen.getByTestId("notification-toast")).toBeInTheDocument();
    expect(screen.getByText("System alert")).toBeInTheDocument();
    expect(screen.getByText("Scheduled maintenance tonight.")).toBeInTheDocument();
  });
});
