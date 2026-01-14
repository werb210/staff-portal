import { describe, expect, test, beforeEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "./SettingsPage";
import { useSettingsStore } from "@/state/settings.store";

let mockRole: "Admin" | "Staff" = "Admin";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User", email: "test@example.com", role: mockRole },
    token: "token-123",
    tokens: null,
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
    expect(screen.getByRole("button", { name: /Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Meeting Links/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Communication/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Silo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Branding/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /User Management/i })).toBeInTheDocument();
  });

  test("updates profile fields", () => {
    renderWithAuth();
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: "Taylor" } });
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Profile updated");
  });

  test("saves meeting link and updates preview", () => {
    renderWithAuth();
    fireEvent.click(screen.getByRole("button", { name: /Meeting Links/i }));
    const input = screen.getByLabelText(/Public meeting URL/i);
    fireEvent.change(input, { target: { value: "https://bookings.office.com/new-link" } });
    fireEvent.click(screen.getByRole("button", { name: /Save link/i }));
    expect(screen.getByRole("link", { name: "https://bookings.office.com/new-link" })).toBeInTheDocument();
  });

  test("updates silo settings", () => {
    renderWithAuth();
    fireEvent.click(screen.getByRole("button", { name: /Silo/i }));
    fireEvent.change(screen.getByLabelText(/Default silo/i), { target: { value: "BI" } });
    expect(screen.getByRole("status")).toHaveTextContent("Default silo updated");
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
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "New User" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "new@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Add user/i }));
    expect(screen.getByText("New User")).toBeInTheDocument();
  });

  test("enforces permissions for non-admins", () => {
    renderWithAuth("Staff");
    expect(screen.queryByRole("button", { name: /User Management/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Communication/i }));
    expect(screen.queryByRole("button", { name: /Refresh O365 Token/i })).not.toBeInTheDocument();
  });

  test("shows communication channels per silo", () => {
    renderWithAuth();
    fireEvent.click(screen.getByRole("button", { name: /Communication/i }));
    expect(screen.getByText(/BF Silo/)).toBeInTheDocument();
    expect(screen.getByText(/BI Silo/)).toBeInTheDocument();
    expect(screen.getByText(/SLF Silo/)).toBeInTheDocument();
  });
});
