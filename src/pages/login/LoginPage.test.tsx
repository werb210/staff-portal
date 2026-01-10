// @vitest-environment jsdom
import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import LoginPage from "./LoginPage";

let loginMock = vi.fn();

vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({
    login: (...args: Parameters<typeof loginMock>) => loginMock(...args)
  })
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: undefined })
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  const renderLogin = (login = vi.fn()) => {
    loginMock = login;

    return render(
      <LoginPage />
    );
  };

  test("submits credentials and navigates on success", async () => {
    const loginMock = vi
      .fn()
      .mockResolvedValue({ accessToken: "token-123", user: { email: "demo@example.com" } });
    renderLogin(loginMock);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("demo@example.com", "password123"));
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  test("shows an error when login fails", async () => {
    const loginMock = vi.fn().mockRejectedValue({ status: 401 });
    renderLogin(loginMock);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(navigateMock).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument());
  });
});
