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
import ReferrerPortal from "./pages/referrer/ReferrerPortal";
import AiControlPage from "./pages/admin/AiControlPage";
import AiChatDashboard from "./pages/admin/AiChatDashboard";
import AiIssueReports from "./pages/admin/AiIssueReports";
import Operations from "./pages/admin/Operations";
import SupportDashboard from "./pages/admin/SupportDashboard";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import WebsiteLeadsPage from "./pages/admin/WebsiteLeadsPage";
import AIKnowledgeBasePage from "./pages/admin/AIKnowledgeBasePage";
import IssueReportsPage from "./pages/admin/IssueReportsPage";
import LiveChatQueuePage from "./pages/admin/LiveChatQueuePage";
import ConversionDashboardPage from "./pages/admin/ConversionDashboardPage";
import LeadsPage from "./pages/admin/LeadsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import ComparisonEditor from "./pages/admin/ComparisonEditor";
import AIKnowledge from "./pages/admin/AIKnowledge";
import AiPolicyEditorPage from "./pages/admin/AiPolicyEditorPage";
import AiKnowledgeUpload from "./pages/admin/AiKnowledgeUpload";
import AiQueuePage from "./pages/ai/AiQueuePage";
import AiLiveChatPage from "./pages/ai/AiLiveChatPage";
import AiConversations from "./pages/comms/AiConversations";
import Leads from "./pages/Leads";
import CreditResults from "./pages/CreditResults";
import ContinuationApplications from "./features/continuation/ContinuationApplications";
import LiveChatPanel from "./features/chat/LiveChatPanel";
import IssueInboxPage from "./pages/IssueInboxPage";
import { emitUiTelemetry } from "./utils/uiTelemetry";
import { useApiHealthCheck } from "./hooks/useApiHealthCheck";
import UiFailureBanner from "./components/UiFailureBanner";
import { getRequestId } from "./utils/requestId";
import { setUiFailure } from "./utils/uiFailureStore";
import { runRouteAudit } from "./utils/routeAudit";
import ErrorBoundary from "./components/system/ErrorBoundary";
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
import ReferrerLayout from "@/components/layout/ReferrerLayout";
import { disconnectAiSocket, initializeAiSocketClient } from "@/services/aiSocket";
import RoleGuard from "@/auth/RoleGuard";
import Unauthorized from "@/pages/Unauthorized";
import { logger } from "@/utils/logger";
import RequireAuth from "@/routes/RequireAuth";

const RouteChangeObserver = () => {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    emitUiTelemetry("page_loaded");
    const from = previousPath.current ?? "initial";
    const to = location.pathname;
    previousPath.current = to;
    logger.info("Route transition", {
      from,
      to,
      requestId: getRequestId(),
      timestamp: new Date().toISOString()
    });
  }, [location.key]);

  return null;
};

const ProtectedApp = () => (
  <RequireAuth roles={["Admin", "Staff", "Lender", "Referrer"]}>
    <PrivateRoute allowedRoles={["Admin", "Staff", "Lender", "Referrer"]}>
      <DataReadyGuard>
        <AppLayout />
      </DataReadyGuard>
    </PrivateRoute>
  </RequireAuth>
);

const PortalSessionGuard = () => {
  usePortalSessionGuard();
  return null;
};

export default function App() {
  useApiHealthCheck();
  const { accessToken, authStatus, logout } = useAuth();
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
      logger.error("Unhandled promise rejection", { requestId, reason: event.reason });
      setUiFailure({
        message: "A background task failed unexpectedly.",
        details: `Request ID: ${requestId}`,
        timestamp: Date.now()
      });
    };

    const handleWindowError = (event: ErrorEvent) => {
      const requestId = getRequestId();
      logger.error("Window error", { requestId, error: event.error, message: event.message });
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
    initializeAiSocketClient();
    return () => {
      disconnectAiSocket();
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
    if (authStatus !== "authenticated") return;

    const timeoutMs = 30 * 60 * 1000;
    let timeoutId: number | undefined;

    const expireSession = () => {
      void logout();
      addNotification(
        buildNotification(
          {
            title: "Session expired",
            body: "Session expired.",
            type: "auth_alert"
          },
          "in_app"
        )
      );
      window.location.assign("/login");
    };

    const resetTimer = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(expireSession, timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [addNotification, authStatus, logout]);

  useEffect(() => {
    const handleSubmit = (event: SubmitEvent) => {
      if (typeof navigator === "undefined" || navigator.onLine) return;
      event.preventDefault();
      event.stopPropagation();
      logger.warn("Blocked submit while offline.");
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
              path="/referrer"
              element={
                <PrivateRoute allowedRoles={["Referrer"]}>
                  <DataReadyGuard>
                    <ReferrerLayout>
                      <ReferrerPortal />
                    </ReferrerLayout>
                  </DataReadyGuard>
                </PrivateRoute>
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
            <Route path="/credit-results" element={<CreditResults />} />
            <Route element={<ProtectedApp />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/applications"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <ApplicationsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/crm"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <CRMPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/communications"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <CommunicationsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/continuations"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <ContinuationApplications />
                  </RoleGuard>
                }
              />
              <Route
                path="/chat"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <LiveChatPanel />
                  </RoleGuard>
                }
              />
              <Route
                path="/issues"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <IssueInboxPage />
                  </RoleGuard>
                }
              />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/tasks" element={<TaskPane />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route
                path="/lenders"
                element={
                  <RoleGuard roles={["Admin", "Staff", "Lender"]}>
                    <LendersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/lenders/new"
                element={
                  <RoleGuard roles={["Admin", "Staff", "Lender"]}>
                    <LendersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/lenders/:lenderId/edit"
                element={
                  <RoleGuard roles={["Admin", "Staff", "Lender"]}>
                    <LendersPage />
                  </RoleGuard>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/:tab" element={<SettingsPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/admin/ai"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AiControlPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/ai/chats"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AiChatDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/ai/issues"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AiIssueReports />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/operations"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <Operations />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <SupportDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AnalyticsDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/website-leads"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <WebsiteLeadsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/ai-knowledge"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AIKnowledgeBasePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/issue-reports"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <IssueReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/live-chat"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <LiveChatQueuePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/conversions"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <ConversionDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/leads"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <LeadsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/analytics-events"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/comparison"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <ComparisonEditor />
                  </RoleGuard>
                }
              />
              <Route
                path="/portal/ai"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <AiQueuePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/portal/ai/:sessionId"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <AiLiveChatPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/ai-policy"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AiPolicyEditorPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/ai-knowledge-upload"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AIKnowledge />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/ai-upload"
                element={
                  <RoleGuard roles={["Admin"]}>
                    <AiKnowledgeUpload />
                  </RoleGuard>
                }
              />
              <Route
                path="/ai-comms"
                element={
                  <RoleGuard roles={["Admin", "Staff"]}>
                    <AiConversations />
                  </RoleGuard>
                }
              />
          </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
