import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, type AuthContextType } from "@/auth/AuthContext";
import SiloContext, { type Silo } from "@/context/SiloContext";
import LenderAuthContext, { type LenderAuthContextValue } from "@/lender/auth/LenderAuthContext";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

const defaultLenderAuth: LenderAuthContextValue = {
  user: {
    id: "l1",
    name: "Lender User",
    email: "lender@example.com",
    role: "Lender",
    companyName: "Lender Co"
  },
  tokens: { accessToken: "lender-token", refreshToken: "lender-refresh" },
  isAuthenticated: true,
  isLoading: false,
  pendingEmail: null,
  pendingSessionId: null,
  login: async () => undefined,
  triggerOtp: async () => undefined,
  verifyOtp: async () => undefined,
  logout: () => undefined
};

type StaffRenderOptions = { silo?: Silo; auth?: Partial<AuthContextType> };

export const renderWithProviders = (ui: ReactElement, options?: StaffRenderOptions) => {
  const queryClient = createTestQueryClient();
  const silo = options?.silo ?? "BF";
  const authValue: AuthContextType = {
    user: { id: "1", email: "test@example.com", role: "Admin" },
    accessToken: "test-token",
    status: "authenticated",
    error: null,
    authenticated: true,
    isAuthenticated: true,
    authReady: true,
    pendingPhoneNumber: null,
    startOtp: async (_payload) => undefined,
    verifyOtp: async (_payload) => undefined,
    login: async () => undefined,
    setAuth: () => undefined,
    setAuthenticated: () => undefined,
    refreshUser: async () => true,
    logout: () => undefined,
    ...options?.auth
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <SiloContext.Provider value={{ silo, setSilo: () => undefined }}>
          {children}
        </SiloContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  return { ...render(ui, { wrapper }), queryClient };
};

export const renderWithLenderProviders = (
  ui: ReactElement,
  options?: { lenderAuth?: Partial<LenderAuthContextValue> }
) => {
  const queryClient = createTestQueryClient();
  const authValue = { ...defaultLenderAuth, ...options?.lenderAuth } as LenderAuthContextValue;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <LenderAuthContext.Provider value={authValue}>{children}</LenderAuthContext.Provider>
    </QueryClientProvider>
  );

  return { ...render(ui, { wrapper }), queryClient };
};
