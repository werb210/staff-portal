import { describe, expect, test, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

let loginMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    login: loginMock,
    logout: vi.fn()
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
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockClear();
    fetchMock.mockRejectedValue(new Error("offline"));
    // @ts-expect-error - allow test override
    global.fetch = fetchMock;
    navigateMock.mockReset();
  });

  const renderLogin = (login = vi.fn()) => {
    loginMock = login;

    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  test("allows login even when health check fails", async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    renderLogin(loginMock);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith({
      email: "demo@example.com",
      password: "password123"
    }));
    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    await waitFor(() => expect(screen.getByText(/API unreachable/i)).toBeInTheDocument());
  });
});
