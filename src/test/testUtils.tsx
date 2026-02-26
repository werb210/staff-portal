import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, type AuthContextValue } from "@/auth/AuthContext";
import { BusinessUnitProvider } from "@/context/BusinessUnitContext";
import { DEFAULT_BUSINESS_UNIT } from "@/types/businessUnit";
import { LenderAuthProvider } from "@/lender/auth/LenderAuthContext";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

type ExtendedRenderOptions = Omit<RenderOptions, "wrapper"> & {
  route?: string;
  auth?: Partial<AuthContextValue>;
};

const createAuthValue = (overrides: Partial<AuthContextValue>): AuthContextValue => ({
  authState: "authenticated",
  status: "authenticated",
  authStatus: "authenticated",
  rolesStatus: "resolved",
  user: { id: "test-user", email: "staff@example.com", role: "Staff" },
  accessToken: "test-token",
  role: "Staff",
  roles: ["Staff"],
  capabilities: [],
  error: null,
  pendingPhoneNumber: null,
  authenticated: true,
  isAuthenticated: true,
  isLoading: false,
  authReady: true,
  isHydratingSession: false,
  login: async () => false,
  startOtp: async () => true,
  verifyOtp: async () => true,
  loginWithOtp: async () => true,
  refreshUser: async () => true,
  clearAuth: () => undefined,
  logout: async () => {
    localStorage.removeItem("persist");
    sessionStorage.removeItem("persist");
  },
  setAuth: () => undefined,
  setUser: () => undefined,
  setAuthenticated: () => undefined,
  setAuthState: () => undefined,
  ...overrides
});

export const renderWithProviders = (ui: ReactElement, options: ExtendedRenderOptions = {}) => {
  const { route = "/", auth = {}, ...rest } = options;
  const queryClient = createQueryClient();

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthContext.Provider value={createAuthValue(auth)}>
            <BusinessUnitProvider>
              {children}
            </BusinessUnitProvider>
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
    ...rest
  });
};

export const renderWithLenderProviders = (ui: ReactElement, options: Omit<RenderOptions, "wrapper"> = {}) => {
  const queryClient = createQueryClient();

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <LenderAuthProvider>{children}</LenderAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
    ...options
  });
};

export const testBusinessUnit = DEFAULT_BUSINESS_UNIT;
