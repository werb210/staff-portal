import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "@/pages/login/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import CRMPage from "@/pages/crm/CRMPage";
import CommunicationsPage from "@/pages/communications/CommunicationsPage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import MarketingPage from "@/pages/marketing/MarketingPage";
import LendersPage from "@/pages/lenders/LendersPage";
import LenderProductsPage from "@/pages/lenders/LenderProductsPage";
import LenderProductDetail from "@/pages/lenders/LenderProductDetail";
import SettingsPage from "@/pages/settings/SettingsPage";
import { fullStaffRoles } from "@/utils/roles";
import LenderRoutes from "./lenderRoutes";
import { AuthProvider } from "@/auth/AuthContext";
import RequireRole from "@/components/auth/RequireRole";
import UnauthorizedPage from "@/pages/Unauthorized";

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
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="crm/*" element={<CRMPage />} />
          <Route path="communications" element={<CommunicationsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="lenders" element={<LendersPage />} />
          <Route path="lenders/new" element={<LendersPage />} />
          <Route path="lenders/:lenderId/edit" element={<LendersPage />} />
          <Route path="lender-products" element={<LenderProductsPage />} />
          <Route path="lender-products/new" element={<LenderProductsPage />} />
          <Route path="lender-products/:productId/edit" element={<LenderProductsPage />} />
          <Route path="lenders/products" element={<LenderProductsPage />} />
          <Route path="settings/*" element={<SettingsPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
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
            path="admin/lender-products/:productId"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <LenderProductDetail />
              </RequireRole>
            }
          />
          <Route
            path="admin/lender-products/:productId/requirements"
            element={
              <RequireRole roles={["Admin"]} fallback={<Navigate to="/unauthorized" replace />}>
                <LenderProductDetail />
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
