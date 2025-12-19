import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppLayout from "@/components/layout/AppLayout";
import AppErrorBoundary from "@/components/layout/AppErrorBoundary";
import AppLoading from "@/components/layout/AppLoading";
import { AuthProvider } from "@/auth/AuthContext";
import { SiloProvider } from "@/context/SiloContext";
import { checkStaffServerHealth } from "./utils/api";
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
  useEffect(() => {
    checkStaffServerHealth()
      .then(() => {
        console.log("✅ Staff Server reachable");
      })
      .catch((err) => {
        console.error("❌ Staff Server unreachable", err);
        alert("Staff Server is unreachable. Check API configuration.");
      });
  }, []);

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
