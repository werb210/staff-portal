import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User", role: "Admin" },
    logout: vi.fn()
  })
}));

vi.mock("@/hooks/useSilo", () => ({
  useSilo: () => ({ silo: "Staff" })
}));

vi.mock("@/state/settings.store", () => ({
  useSettingsStore: () => ({
    branding: { logoUrl: "", logoWidth: 220 }
  })
}));

describe("AppLayout", () => {
  test("mobile navigation toggles with the hamburger", () => {
    window.innerWidth = 375;
    window.dispatchEvent(new Event("resize"));

    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const toggleButton = screen.getByLabelText(/Toggle navigation/i);
    fireEvent.click(toggleButton);

    const sidebar = container.querySelector(".sidebar");
    expect(sidebar).toHaveClass("sidebar--open");
  });
});
