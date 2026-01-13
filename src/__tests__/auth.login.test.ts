// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import apiClient, { otpRequestOptions } from "@/api/client";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fetchCurrentUser } from "@/api/auth";
import { verifyOtp } from "@/services/auth";
import { getStoredAccessToken, getStoredUser, setStoredAccessToken, setStoredRefreshToken, setStoredUser } from "@/services/token";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

vi.mock("@/api/auth", () => ({
  fetchCurrentUser: vi.fn()
}));

vi.mock("@/services/api", async () => {
  const actual = await vi.importActual<typeof import("@/services/api")>("@/services/api");
  return {
    ...actual,
    redirectToLogin: vi.fn()
  };
});

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const adapter = vi.fn(async (config) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config,
}));

const TestAuthState = () => {
  const { status, user, token } = useAuth();
  return createElement(
    "div",
    null,
    createElement("span", { "data-testid": "status" }, status),
    createElement("span", { "data-testid": "token" }, token ?? ""),
    createElement("span", { "data-testid": "user" }, user?.email ?? "")
  );
};

const TestVerifyAction = () => {
  const { verifyOtp } = useAuth();

  return createElement(
    "button",
    { type: "button", onClick: () => void verifyOtp({ code: "123456", phone: "+15555550100" }) },
    "Verify"
  );
};

describe("auth login", () => {
  beforeEach(() => {
    adapter.mockClear();
    localStorage.clear();
    vi.restoreAllMocks();
    mockedFetchCurrentUser.mockResolvedValue({ id: "1", email: "demo@example.com", role: "ADMIN" });
  });

  it("OTP start omits Idempotency-Key", async () => {
    const startAdapter = vi.fn(async (config) => ({
      data: {
        sessionId: "session-1",
        requestId: "req-1"
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    const response = await apiClient.post<{ sessionId?: string; requestId?: string }>(
      "/api/auth/otp/start",
      { phone: "+15555550100" },
      { ...otpRequestOptions, adapter: startAdapter } as any
    );

    expect(startAdapter).toHaveBeenCalledOnce();
    const passedConfig = startAdapter.mock.calls[0][0];
    const idempotencyKey =
      passedConfig?.headers?.["Idempotency-Key"] ?? passedConfig?.headers?.get?.("Idempotency-Key");
    expect(idempotencyKey).toBeUndefined();
    expect(passedConfig?.withCredentials).toBe(true);
    expect(response.sessionId).toBe("session-1");
    expect(response.requestId).toBe("req-1");
  });

  it("OTP verification returns tokens from the service", async () => {
    const apiPostSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature",
      refreshToken: "refresh-123",
      user: { id: "1", email: "demo@example.com", role: "ADMIN" },
    } as any);

    await expect(verifyOtp({ phone: "+15555550100", code: "123456" })).resolves.toMatchObject({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature",
      refreshToken: "refresh-123"
    });

    expect(apiPostSpy).toHaveBeenCalledWith(
      "/api/auth/otp/verify",
      { phone: "+15555550100", code: "123456" },
      otpRequestOptions
    );
    apiPostSpy.mockRestore();
  });

  it("retains existing adapter behavior", async () => {
    await apiClient.get("/example", { adapter, skipAuth: true } as any);
    expect(adapter).toHaveBeenCalledOnce();
  });

  it("stores tokens after a successful OTP verification", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature",
      refreshToken: "refresh-456",
      user: { id: "1", email: "demo@example.com", role: "ADMIN" }
    });

    render(createElement(AuthProvider, null, createElement(TestVerifyAction)));

    screen.getByRole("button", { name: "Verify" }).click();

    await waitFor(() => expect(getStoredAccessToken()).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature"));
    expect(getStoredUser<{ email: string }>()?.email).toBe("demo@example.com");
  });

  it("restores session on reload", async () => {
    setStoredAccessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature");
    setStoredRefreshToken("refresh-999");
    setStoredUser({ id: "1", email: "restored@example.com", role: "ADMIN" });

    render(createElement(AuthProvider, null, createElement(TestAuthState)));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("token")).toHaveTextContent("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload.signature");
    expect(screen.getByTestId("user")).toHaveTextContent("demo@example.com");
  });
});
