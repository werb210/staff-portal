import { useEffect, useMemo, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import SettingsPage from "./pages/settings/SettingsPage";
import TaskPane from "./pages/tasks/TaskPane";
import { emitUiTelemetry } from "./utils/uiTelemetry";
import { useApiHealthCheck } from "./hooks/useApiHealthCheck";
import UiFailureBanner from "./components/UiFailureBanner";
import { getRequestId } from "./utils/requestId";
import { setUiFailure } from "./utils/uiFailureStore";
import { runRouteAudit } from "./utils/routeAudit";
import { RequireRole as RequireClientRole } from "./guards/RequireRole";
import { fullStaffRoles } from "./utils/roles";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";
import InstallPromptBanner from "./components/InstallPromptBanner";
import { flushQueuedMutations, registerBackgroundSync } from "./utils/backgroundSyncQueue";

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
  <PrivateRoute allowedRoles={fullStaffRoles}>
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
        message: "An error occurred while loading the page.",
        details: `Request ID: ${requestId}`,
        timestamp: Date.now()
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    void runRouteAudit();
    void registerBackgroundSync();

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      void flushQueuedMutations();
    };
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_OFFLINE_QUEUE") {
        void flushQueuedMutations();
      }
    };

    window.addEventListener("online", handleOnline);
    navigator.serviceWorker?.addEventListener("message", handleSyncMessage);
    void flushQueuedMutations();

    return () => {
      window.removeEventListener("online", handleOnline);
      navigator.serviceWorker?.removeEventListener("message", handleSyncMessage);
    };
  }, []);

  useEffect(() => {
    let lastTouchEnd = 0;
    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => document.removeEventListener("touchend", handleTouchEnd);
  }, []);

  useEffect(() => {
    const handleSubmit = (event: SubmitEvent) => {
      if (typeof navigator === "undefined" || navigator.onLine) return;
      event.preventDefault();
      event.stopPropagation();
      console.info("Blocked submit while offline.");
    };
    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UiFailureBanner />
      <OfflineBanner />
      <InstallPromptBanner />
      <ErrorBoundary>
        <BrowserRouter>
          <RouteChangeObserver />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedApp />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/crm" element={<CRMPage />} />
              <Route path="/communications" element={<CommunicationsPage />} />
              <Route path="/comms" element={<CommunicationsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/tasks" element={<TaskPane />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route
                path="/lenders"
                element={
                  <RequireClientRole allow={["Admin", "Staff", "Lender"]}>
                    <LendersPage />
                  </RequireClientRole>
                }
              />
              <Route
                path="/lenders/new"
                element={
                  <RequireClientRole allow={["Admin", "Staff", "Lender"]}>
                    <LendersPage />
                  </RequireClientRole>
                }
              />
              <Route
                path="/lenders/:lenderId/edit"
                element={
                  <RequireClientRole allow={["Admin", "Staff", "Lender"]}>
                    <LendersPage />
                  </RequireClientRole>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
