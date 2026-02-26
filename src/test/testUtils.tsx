import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, AuthProvider, type AuthContextValue } from "@/auth/AuthContext";
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
  logout: async () => undefined,
  setAuth: () => undefined,
  setUser: () => undefined,
  setAuthenticated: () => undefined,
  setAuthState: () => undefined,
  ...overrides
});

const withAuthAndBusinessUnit = (children: ReactNode, auth?: Partial<AuthContextValue>) => {
  if (auth) {
    return (
      <AuthContext.Provider value={createAuthValue(auth)}>
        <BusinessUnitProvider>{children}</BusinessUnitProvider>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthProvider>
      <BusinessUnitProvider>{children}</BusinessUnitProvider>
    </AuthProvider>
  );
};

export const wrapper = ({
  children,
  route = "/",
  auth,
  withRouter = true
}: {
  children: ReactNode;
  route?: string;
  auth?: Partial<AuthContextValue>;
  withRouter?: boolean;
}) => {
  const queryClient = createQueryClient();
  const app = withAuthAndBusinessUnit(children, auth);

  return (
    <QueryClientProvider client={queryClient}>
      {withRouter ? <MemoryRouter initialEntries={[route]}>{app}</MemoryRouter> : app}
    </QueryClientProvider>
  );
};

export const renderWithProviders = (ui: ReactElement, options: ExtendedRenderOptions = {}) => {
  const { route = "/", auth, ...rest } = options;
  const hasRouterRoot = ui.type === MemoryRouter;

  return render(ui, {
    wrapper: ({ children }) => wrapper({ children, route, auth, withRouter: !hasRouterRoot }),
    ...rest
  });
};

export const renderWithHooks = renderWithProviders;

export const renderWithLenderProviders = (ui: ReactElement, options: Omit<RenderOptions, "wrapper"> = {}) => {
  const queryClient = createQueryClient();
  const hasRouterRoot = ui.type === MemoryRouter;

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {hasRouterRoot ? <LenderAuthProvider>{children}</LenderAuthProvider> : <MemoryRouter initialEntries={["/"]}><LenderAuthProvider>{children}</LenderAuthProvider></MemoryRouter>}
      </QueryClientProvider>
    ),
    ...options
  });
};

export const testBusinessUnit = DEFAULT_BUSINESS_UNIT;
