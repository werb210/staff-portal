import { describe, expect, test, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SettingsPage from "./SettingsPage";
import ProfileSettings from "./tabs/ProfileSettings";
import BrandingSettings from "./tabs/BrandingSettings";
import RuntimeSettings from "./tabs/RuntimeSettings";
import UserManagement from "./tabs/UserManagement";
import SettingsSectionLayout from "./components/SettingsSectionLayout";
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
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/settings/profile"
          element={
            <SettingsSectionLayout>
              <ProfileSettings />
            </SettingsSectionLayout>
          }
        />
        <Route
          path="/settings/branding"
          element={
            <SettingsSectionLayout>
              <BrandingSettings />
            </SettingsSectionLayout>
          }
        />
        <Route
          path="/settings/runtime"
          element={
            <SettingsSectionLayout>
              <RuntimeSettings />
            </SettingsSectionLayout>
          }
        />
        <Route
          path="/settings/users"
          element={
            <SettingsSectionLayout>
              <UserManagement />
            </SettingsSectionLayout>
          }
        />
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
  test("renders settings overview cards for admins", () => {
    renderWithAuth("Admin");
    expect(screen.getByRole("link", { name: /My Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Branding/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Runtime Verification/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /User Management/i })).toBeInTheDocument();
  });

  test("updates profile fields", async () => {
    mockPatch.mockResolvedValueOnce({
      name: "Taylor",
      email: "test@example.com",
      phone: "555-0100"
    });
    renderWithAuth("Admin", "/settings/profile");
    await screen.findByRole("heading", { name: /My profile/i });
    const refreshButton = screen.getByRole("button", { name: /Refresh profile/i });
    fireEvent.click(refreshButton);
    await waitFor(() => expect(refreshButton).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: "Taylor" } });
    fireEvent.click(screen.getByRole("button", { name: /(Save changes|Saving\.\.\.)/i }));
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
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: "New" } });
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: "User" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "new@example.com" } });
    const addButtons = screen.getAllByRole("button", { name: /Add user/i });
    fireEvent.click(addButtons[addButtons.length - 1]);
    const newUserEmails = await screen.findAllByText("new@example.com");
    expect(newUserEmails.length).toBeGreaterThan(0);
  });

  test("enforces permissions for non-admins", () => {
    renderWithAuth("Staff", "/settings/runtime");
    expect(screen.queryByRole("link", { name: /User Management/i })).not.toBeInTheDocument();
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
    const fileReaderSpy = vi.fn();
    class MockFileReader extends EventTarget implements FileReader {
      readonly EMPTY = 0;
      readonly LOADING = 1;
      readonly DONE = 2;
      error: DOMException | null = null;
      onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readyState: 0 | 1 | 2 = 0;
      result: string | ArrayBuffer | null = null;
      abort() {
        this.readyState = this.DONE;
        this.onabort?.(new ProgressEvent("abort") as ProgressEvent<FileReader>);
      }
      readAsArrayBuffer() {
        this.result = new ArrayBuffer(0);
        this.readyState = this.DONE;
        this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
        this.onloadend?.(new ProgressEvent("loadend") as ProgressEvent<FileReader>);
      }
      readAsBinaryString() {
        this.result = "";
        this.readyState = this.DONE;
        this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
        this.onloadend?.(new ProgressEvent("loadend") as ProgressEvent<FileReader>);
      }
      readAsDataURL() {
        this.result = "data:image/png;base64,preview";
        this.readyState = this.DONE;
        fileReaderSpy();
        this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
        this.onloadend?.(new ProgressEvent("loadend") as ProgressEvent<FileReader>);
      }
      readAsText() {
        this.result = "";
        this.readyState = this.DONE;
        this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
        this.onloadend?.(new ProgressEvent("loadend") as ProgressEvent<FileReader>);
      }
    }
    Object.defineProperty(window, "FileReader", { value: MockFileReader });

    renderWithAuth("Admin", "/settings/branding");
    const fileInput = await screen.findByLabelText(/Upload logo/i);
    const file = new File(["logo"], "logo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const preview = screen.getByAltText(/Company logo preview/i) as HTMLImageElement;
    expect(fileReaderSpy).toHaveBeenCalled();
    expect(preview.src).toContain("data:image/png;base64,preview");
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
    const refreshButton = screen.getByRole("button", { name: /Refresh profile/i });
    fireEvent.click(refreshButton);
    await waitFor(() => expect(refreshButton).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: "Taylor Updated" } });
    const saveButton = screen.getByRole("button", { name: /(Save changes|Saving\.\.\.)/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Profile updated"));

    unmount();
    useSettingsStore.getState().reset();

    renderWithAuth("Admin", "/settings/profile");
    fireEvent.click(screen.getByRole("button", { name: /(Refresh profile|Refreshing\.\.\.)/i }));
    await waitFor(() => expect(screen.getByLabelText(/First name/i)).toHaveValue("Taylor Updated"));
  });
});
