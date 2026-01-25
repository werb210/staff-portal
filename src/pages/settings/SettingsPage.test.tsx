import { describe, expect, test, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SettingsPage from "./SettingsPage";
import { useSettingsStore } from "@/state/settings.store";

let mockRole: "Admin" | "Staff" = "Admin";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock("@/api/httpClient", () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args)
  }
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User", email: "test@example.com", role: mockRole },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn()
  })
}));

const renderWithAuth = (role: "Admin" | "Staff" = "Admin", route: string = "/settings") => {
  mockRole = role;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/settings/*" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => {
  useSettingsStore.getState().reset();
  mockGet.mockReset();
  mockPost.mockReset();
  mockPatch.mockReset();
  mockGet.mockImplementation((path: string) => {
    if (path === "/users/me") {
      return Promise.resolve({
        name: "Test User",
        email: "test@example.com",
        phone: "555-0100"
      });
    }
    if (path === "/settings/branding") {
      return Promise.resolve({
        logoUrl: "https://placehold.co/200x60?text=Logo",
        logoWidth: 220
      });
    }
    if (path === "/users") {
      return Promise.resolve([
        { id: "u-1", name: "Alex Smith", email: "alex@example.com", role: "Admin", disabled: false }
      ]);
    }
    return Promise.resolve({});
  });
});

describe("SettingsPage", () => {
  test("renders all tabs for admins", () => {
    renderWithAuth("Admin");
    expect(screen.getByRole("button", { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /My Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Branding/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Runtime Verification/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /User Management/i })).toBeInTheDocument();
  });

  test("updates profile fields", async () => {
    mockPatch.mockResolvedValueOnce({
      name: "Taylor",
      email: "test@example.com",
      phone: "555-0100"
    });
    renderWithAuth("Admin", "/settings/profile");
    await screen.findByRole("heading", { name: /My profile/i });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Taylor" } });
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Profile updated"));
  });

  test("renders branding preview", () => {
    renderWithAuth("Admin", "/settings/branding");
    return screen.findByAltText(/Company logo preview/i);
  });

  test("allows admin user management", async () => {
    mockPost.mockResolvedValueOnce({
      id: "u-2",
      name: "New User",
      email: "new@example.com",
      role: "Staff",
      disabled: false
    });
    renderWithAuth("Admin", "/settings/users");
    await screen.findByRole("heading", { name: /Admin: User Management/i });
    fireEvent.click(screen.getByRole("button", { name: /Add user/i }));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "New User" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "new@example.com" } });
    const addButtons = screen.getAllByRole("button", { name: /Add user/i });
    fireEvent.click(addButtons[addButtons.length - 1]);
    const newUserEmails = await screen.findAllByText("new@example.com");
    expect(newUserEmails.length).toBeGreaterThan(0);
  });

  test("enforces permissions for non-admins", () => {
    renderWithAuth("Staff", "/settings/runtime");
    expect(screen.queryByRole("button", { name: /User Management/i })).not.toBeInTheDocument();
    return screen.findByRole("heading", { name: /Runtime verification/i });
  });

  test("disables user updates status", async () => {
    mockPost.mockResolvedValueOnce({
      id: "u-1",
      name: "Alex Smith",
      email: "alex@example.com",
      role: "Admin",
      disabled: true
    });
    renderWithAuth("Admin", "/settings/users");
    await screen.findByRole("heading", { name: /Admin: User Management/i });
    const disableButtons = screen.getAllByRole("button", { name: /Disable/i });
    fireEvent.click(disableButtons[0]);
    const disabledPills = await screen.findAllByText(/Disabled/i);
    expect(disabledPills.length).toBeGreaterThan(0);
  });

  test("logo upload previews correctly", async () => {
    const createObjectURL = vi.fn(() => "blob:logo-preview");
    Object.defineProperty(global.URL, "createObjectURL", { value: createObjectURL });

    renderWithAuth("Admin", "/settings/branding");
    const fileInput = await screen.findByLabelText(/Upload logo/i);
    const file = new File(["logo"], "logo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const preview = screen.getByAltText(/Company logo preview/i) as HTMLImageElement;
    expect(preview.src).toContain("blob:logo-preview");
  });

  test("profile save persists on reload", async () => {
    let profileData = {
      name: "Test User",
      email: "test@example.com",
      phone: "555-0100"
    };

    mockGet.mockImplementation((path: string) => {
      if (path === "/users/me") {
        return Promise.resolve(profileData);
      }
      if (path === "/settings/branding") {
        return Promise.resolve({
          logoUrl: "https://placehold.co/200x60?text=Logo",
          logoWidth: 220
        });
      }
      if (path === "/users") {
        return Promise.resolve([
          { id: "u-1", name: "Alex Smith", email: "alex@example.com", role: "Admin", disabled: false }
        ]);
      }
      return Promise.resolve({});
    });

    mockPatch.mockImplementation((_path: string, updates: Partial<typeof profileData>) => {
      profileData = { ...profileData, ...updates };
      return Promise.resolve(profileData);
    });

    const { unmount } = renderWithAuth("Admin", "/settings/profile");
    await screen.findByRole("heading", { name: /My profile/i });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Taylor Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Profile updated"));

    unmount();
    useSettingsStore.getState().reset();

    renderWithAuth("Admin", "/settings/profile");
    await waitFor(() => expect(screen.getByLabelText(/Name/i)).toHaveValue("Taylor Updated"));
  });
});
