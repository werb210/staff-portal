import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppLayout from "@/components/layout/AppLayout";
import AppErrorBoundary from "@/components/layout/AppErrorBoundary";
import AppLoading from "@/components/layout/AppLoading";
import { AuthProvider } from "@/context/AuthContext";
import { SiloProvider } from "@/context/SiloContext";
import { checkStaffServerHealth } from "@/utils/api";
import PrivateRoute from "./router/PrivateRoute";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LoginPage from "./pages/login/LoginPage";
import ApplicationsPage from "./pages/applications/ApplicationsPage";
import CRMPage from "./pages/crm/CRMPage";
import CommunicationsPage from "./pages/communications/CommunicationsPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import MarketingPage from "./pages/marketing/MarketingPage";
import LendersPage from "./pages/lenders/LendersPage";
import SettingsPage from "./pages/settings/SettingsPage";
import LenderRoutes from "./router/lenderRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => {
  const [healthStatus, setHealthStatus] = useState<"pending" | "ok" | "error">("pending");
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        await checkStaffServerHealth();
        // eslint-disable-next-line no-console
        console.log("Staff Server connected");
        setHealthStatus("ok");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to connect to Staff Server", error);
        setHealthError("Staff Server unreachable");
        setHealthStatus("error");
      }
    };

    void verifyConnection();
  }, []);

  if (healthStatus === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "#0b1120",
          color: "#ffffff",
          textAlign: "center",
          padding: "2rem"
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>BACKEND NOT CONNECTED</h1>
        <p style={{ fontSize: "1.25rem" }}>{healthError}</p>
      </div>
    );
  }

  if (healthStatus === "pending") {
    return <AppLoading />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AuthProvider>
        <SiloProvider>
          <AppErrorBoundary>
            <Suspense fallback={<AppLoading />}>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/lender/*" element={<LenderRoutes />} />
                  <Route element={<PrivateRoute />}>
                    <Route element={<AppLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="applications" element={<ApplicationsPage />} />
                      <Route path="crm" element={<CRMPage />} />
                      <Route path="communications" element={<CommunicationsPage />} />
                      <Route path="calendar" element={<CalendarPage />} />
                      <Route path="marketing" element={<MarketingPage />} />
                      <Route path="lenders" element={<LendersPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </Suspense>
          </AppErrorBoundary>
        </SiloProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
