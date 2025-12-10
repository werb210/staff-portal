import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthContext, { type AuthContextValue } from "@/context/AuthContext";
import SiloContext, { type Silo } from "@/context/SiloContext";
import LenderAuthContext, { type LenderAuthContextValue } from "@/lender/auth/LenderAuthContext";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

const defaultAuth: AuthContextValue = {
  user: { id: "1", name: "Test User", email: "test@example.com", role: "ADMIN" },
  tokens: { accessToken: "token", refreshToken: "refresh" },
  isAuthenticated: true,
  isLoading: false,
  login: async () => undefined,
  logout: () => undefined
};

const defaultLenderAuth: LenderAuthContextValue = {
  user: { id: "l1", name: "Lender User", email: "lender@example.com", role: "LENDER", companyName: "Lender Co" },
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

export const renderWithProviders = (
  ui: ReactElement,
  options?: { silo?: Silo; auth?: Partial<AuthContextValue> }
) => {
  const queryClient = createTestQueryClient();
  const authValue = { ...defaultAuth, ...options?.auth } as AuthContextValue;
  const silo = options?.silo ?? "BF";

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
