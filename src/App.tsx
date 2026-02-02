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
import { getDisplayMode } from "./utils/pwa";
import DataReadyGuard from "./guards/DataReadyGuard";
import UpdatePromptBanner from "./components/UpdatePromptBanner";
import UpdatePromptBoundary from "./components/errors/UpdatePromptBoundary";
import { useAuth } from "./auth/AuthContext";
import { resetAuthState } from "./utils/authReset";
import { useNotificationAudio } from "@/hooks/useNotificationAudio";
import { useNotificationsStore } from "@/state/notifications.store";
import { buildNotification } from "@/utils/notifications";
import type { PushNotificationPayload } from "@/types/notifications";
import { usePortalSessionGuard } from "@/auth/portalSessionGuard";
import { triggerSafeReload } from "@/utils/reloadGuard";

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
    <DataReadyGuard>
      <AppLayout />
    </DataReadyGuard>
  </PrivateRoute>
);

const PortalSessionGuard = () => {
  usePortalSessionGuard();
  return null;
};

export default function App() {
  useApiHealthCheck();
  const { accessToken } = useAuth();
  const { playNotificationSound } = useNotificationAudio();
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { throwOnError: false },
          mutations: { throwOnError: false }
        }
      }),
    []
  );
  const previousTokenRef = useRef<string | null>(accessToken);

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
  }, [addNotification, playNotificationSound]);

  useEffect(() => {
    if (previousTokenRef.current === accessToken) return;
    previousTokenRef.current = accessToken;
    queryClient.clear();
    void resetAuthState();
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready
        .then((registration) => {
          registration.active?.postMessage({ type: "AUTH_CHANGED" });
        })
        .catch(() => undefined);
    }
  }, [accessToken, queryClient]);

  useEffect(() => {
    const handleOnline = () => {
      void flushQueuedMutations();
    };
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_OFFLINE_QUEUE") {
        void flushQueuedMutations();
        return;
      }
      if (event.data?.type === "SW_ACTIVATED") {
        if (!navigator.serviceWorker?.controller) {
          return;
        }
        triggerSafeReload("service-worker-activated");
        return;
      }
      if (event.data?.type === "PUSH_NOTIFICATION") {
        const payload = event.data.payload as PushNotificationPayload;
        addNotification(buildNotification(payload ?? {}, "push"));
        if ("setAppBadge" in navigator) {
          (navigator as Navigator & { setAppBadge?: (value?: number) => Promise<void> })
            .setAppBadge?.(1)
            .catch(() => undefined);
        }
        if ("vibrate" in navigator) {
          navigator.vibrate?.([80, 60, 80]);
        }
        playNotificationSound();
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
    const applyDisplayMode = () => {
      document.documentElement.dataset.displayMode = getDisplayMode();
    };

    applyDisplayMode();
    window.addEventListener("resize", applyDisplayMode);
    window.addEventListener("pageshow", applyDisplayMode);
    document.addEventListener("visibilitychange", applyDisplayMode);

    return () => {
      window.removeEventListener("resize", applyDisplayMode);
      window.removeEventListener("pageshow", applyDisplayMode);
      document.removeEventListener("visibilitychange", applyDisplayMode);
    };
  }, []);

  useEffect(() => {
    const refreshServiceWorker = () => {
      if (document.visibilityState !== "visible") return;
      if (!("serviceWorker" in navigator)) return;
      void navigator.serviceWorker.ready
        .then((registration) => registration.update())
        .catch(() => undefined);
    };
    window.addEventListener("pageshow", refreshServiceWorker);
    document.addEventListener("visibilitychange", refreshServiceWorker);
    return () => {
      window.removeEventListener("pageshow", refreshServiceWorker);
      document.removeEventListener("visibilitychange", refreshServiceWorker);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-vh", `${viewportHeight * 0.01}px`);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("scroll", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("scroll", updateViewport);
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
      <UpdatePromptBoundary>
        <UpdatePromptBanner />
      </UpdatePromptBoundary>
      <ErrorBoundary>
        <BrowserRouter>
          <PortalSessionGuard />
          <RouteChangeObserver />
          <Routes>
            <Route
              path="/login"
              element={
                <DataReadyGuard>
                  <LoginPage />
                </DataReadyGuard>
              }
            />
            <Route
              path="/auth/callback"
              element={
                <DataReadyGuard>
                  <LoginPage />
                </DataReadyGuard>
              }
            />
            <Route
              path="/auth/microsoft/callback"
              element={
                <DataReadyGuard>
                  <LoginPage />
                </DataReadyGuard>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedApp />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/crm" element={<CRMPage />} />
              <Route path="/communications" element={<CommunicationsPage />} />
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
              <Route path="/settings/:tab" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
