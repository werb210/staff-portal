import { describe, expect, test, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { actAsync } from "@/test/testUtils";

let loginMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    token: null,
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

  const renderLogin = async (login = vi.fn()) => {
    loginMock = login;

    let renderResult: ReturnType<typeof render> | undefined;
    await actAsync(() => {
      renderResult = render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
    });
    return renderResult;
  };

  test("submits credentials and navigates on success", async () => {
    const loginMock = vi
      .fn()
      .mockResolvedValue({ accessToken: "token-123", user: { email: "demo@example.com" } });
    await renderLogin(loginMock);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    await actAsync(() => {
      fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    });

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("demo@example.com", "password123"));
    expect(navigateMock).toHaveBeenCalledWith("/applications", { replace: true });
  });

  test("shows an error when login fails", async () => {
    const loginMock = vi.fn().mockRejectedValue({ response: { status: 401 } });
    await renderLogin(loginMock);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrong" } });
    await actAsync(() => {
      fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    });

    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(navigateMock).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument());
  });
});
