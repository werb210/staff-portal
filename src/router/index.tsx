import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "@/pages/login/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import ApplicationShellPage from "@/pages/applications/ApplicationShellPage";
import CRMPage from "@/pages/crm/CRMPage";
import CommunicationsPage from "@/pages/communications/CommunicationsPage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import MarketingPage from "@/pages/marketing/MarketingPage";
import LendersPage from "@/pages/lenders/LendersPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import { fullStaffRoles } from "@/utils/roles";
import LenderRoutes from "./lenderRoutes";
import { AuthProvider } from "@/auth/AuthContext";
import RequireRole from "@/components/auth/RequireRole";
import UnauthorizedPage from "@/pages/Unauthorized";
import AIKnowledgeManager from "@/pages/admin/AIKnowledgeManager";
import SupportDashboard from "@/pages/admin/SupportDashboard";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import WebsiteLeadsPage from "@/pages/admin/WebsiteLeadsPage";
import AIKnowledgeBasePage from "@/pages/admin/AIKnowledgeBasePage";
import IssueReportsPage from "@/pages/admin/IssueReportsPage";
import LiveChatQueuePage from "@/pages/admin/LiveChatQueuePage";
import ConversionDashboardPage from "@/pages/admin/ConversionDashboardPage";

const AppRouter = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lender/*" element={<LenderRoutes />} />
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={fullStaffRoles}>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pipeline" element={<ApplicationsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationShellPage />} />
          <Route path="crm/*" element={<CRMPage />} />
          <Route path="communications" element={<CommunicationsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="lenders" element={<LendersPage />} />
          <Route path="lenders/new" element={<LendersPage />} />
          <Route path="lenders/:lenderId/edit" element={<LendersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/:tab" element={<SettingsPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="admin/ai"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <AIKnowledgeManager />
              </RequireRole>
            }
          />
          <Route
            path="admin/support"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <SupportDashboard />
              </RequireRole>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <AnalyticsDashboard />
              </RequireRole>
            }
          />
          <Route
            path="admin/lenders"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <LendersPage />
              </RequireRole>
            }
          />
          <Route
            path="admin/lenders/:lenderId"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <LendersPage />
              </RequireRole>
            }
          />
          <Route
            path="admin/website-leads"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <WebsiteLeadsPage />
              </RequireRole>
            }
          />
          <Route
            path="admin/ai-knowledge"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <AIKnowledgeBasePage />
              </RequireRole>
            }
          />
          <Route
            path="admin/issue-reports"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <IssueReportsPage />
              </RequireRole>
            }
          />
          <Route
            path="admin/live-chat"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <LiveChatQueuePage />
              </RequireRole>
            }
          />
          <Route
            path="admin/conversions"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <ConversionDashboardPage />
              </RequireRole>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default AppRouter;
