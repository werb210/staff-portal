import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/AuthContext";
import SiloContext, { type Silo } from "@/context/SiloContext";
import LenderAuthContext, { type LenderAuthContextValue } from "@/lender/auth/LenderAuthContext";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

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
  options?: { silo?: Silo }
) => {
  const queryClient = createTestQueryClient();
  const silo = options?.silo ?? "BF";

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiloContext.Provider value={{ silo, setSilo: () => undefined }}>
          {children}
        </SiloContext.Provider>
      </AuthProvider>
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
