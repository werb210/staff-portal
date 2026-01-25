import { describe, expect, test, beforeEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "./SettingsPage";
import { useSettingsStore } from "@/state/settings.store";

let mockRole: "Admin" | "Staff" = "Admin";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User", email: "test@example.com", role: mockRole },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn()
  })
}));

const renderWithAuth = (role: "Admin" | "Staff" = "Admin") => {
  mockRole = role;
  return render(<SettingsPage />);
};

beforeEach(() => {
  useSettingsStore.getState().reset();
});

describe("SettingsPage", () => {
  test("renders all tabs for admins", () => {
    renderWithAuth("Admin");
    expect(screen.getByRole("button", { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Branding/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Runtime/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /User Management/i })).toBeInTheDocument();
  });

  test("updates profile fields", () => {
    renderWithAuth();
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: "Taylor" } });
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Profile updated");
  });

  test("renders branding preview", () => {
    renderWithAuth();
    fireEvent.click(screen.getByRole("button", { name: /Branding/i }));
    expect(screen.getByAltText(/Current favicon/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Company logo/i)).toBeInTheDocument();
  });

  test("allows admin user management", () => {
    renderWithAuth();
    fireEvent.click(screen.getByRole("button", { name: /User Management/i }));
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "new@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Add user/i }));
    expect(screen.getByText("new@example.com")).toBeInTheDocument();
  });

  test("enforces permissions for non-admins", () => {
    renderWithAuth("Staff");
    expect(screen.queryByRole("button", { name: /User Management/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Runtime/i }));
    expect(screen.getByText(/Runtime status/i)).toBeInTheDocument();
  });
});
