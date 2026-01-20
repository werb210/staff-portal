import { useEffect, useMemo, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivateRoute from "./router/PrivateRoute";
import LoginPage from "./pages/login/LoginPage";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ApplicationsPage from "./pages/applications/ApplicationsPage";
import CRMPage from "./pages/crm/CRMPage";
import CommunicationsPage from "./pages/communications/CommunicationsPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import MarketingPage from "./pages/marketing/MarketingPage";
import LendersPage from "./pages/lenders/LendersPage";
import LenderProductsPage from "./pages/lenders/LenderProductsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TaskPane from "./pages/tasks/TaskPane";
import { emitUiTelemetry } from "./utils/uiTelemetry";
import { useApiHealthCheck } from "./hooks/useApiHealthCheck";
import UiFailureBanner from "./components/UiFailureBanner";
import { getRequestId } from "./utils/requestId";
import { setUiFailure } from "./utils/uiFailureStore";

const RouteChangeObserver = () => {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    emitUiTelemetry("page_loaded");
    const from = previousPath.current ?? "initial";
    const to = location.pathname;
    previousPath.current = to;
    console.info("Route transition", {
      from,
      to,
      requestId: getRequestId(),
      timestamp: new Date().toISOString()
    });
  }, [location.key]);

  return null;
};

const ProtectedApp = () => (
  <PrivateRoute>
    <AppLayout />
  </PrivateRoute>
);

export default function App() {
  useApiHealthCheck();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { throwOnError: true },
          mutations: { throwOnError: true }
        }
      }),
    []
  );

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const requestId = getRequestId();
      console.error("Unhandled promise rejection", { requestId, reason: event.reason });
      setUiFailure({
        message: "A background task failed unexpectedly.",
        details: `Request ID: ${requestId}`,
        timestamp: Date.now()
      });
    };

    const handleWindowError = (event: ErrorEvent) => {
      const requestId = getRequestId();
      console.error("Window error", { requestId, error: event.error, message: event.message });
      setUiFailure({
        message: "An unexpected error occurred.",
        details: `Request ID: ${requestId}`,
        timestamp: Date.now()
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UiFailureBanner />
      <BrowserRouter>
        <RouteChangeObserver />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedApp />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/crm" element={<CRMPage />} />
            <Route path="/communications" element={<CommunicationsPage />} />
            <Route path="/comms" element={<CommunicationsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TaskPane />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/lenders" element={<LendersPage />} />
            <Route path="/lenders/new" element={<LendersPage />} />
            <Route path="/lenders/:lenderId/edit" element={<LendersPage />} />
            <Route path="/lender-products" element={<LenderProductsPage />} />
            <Route path="/lender-products/new" element={<LenderProductsPage />} />
            <Route path="/lender-products/:productId/edit" element={<LenderProductsPage />} />
            <Route path="/lenders/products" element={<LenderProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
