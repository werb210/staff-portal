import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppRoot from "@/components/layout/AppRoot";
import LoginPage from "@/pages/auth/LoginPage";
import Unauthorized from "@/pages/auth/Unauthorized";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import DocumentsPage from "@/pages/documents/DocumentsPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import MarketingPage from "@/pages/marketing/MarketingPage";
import PipelinePage from "@/pages/pipeline/PipelinePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import AdminPage from "@/pages/roles/AdminPage";
import LenderPage from "@/pages/roles/LenderPage";
import ReferrerPage from "@/pages/roles/ReferrerPage";
import { Role, useAuthStore } from "@/store/auth";

function RoleRedirect() {
  const role = useAuthStore((state) => state.role);

  const redirectForRole: Record<Exclude<Role, null>, string> = {
    admin: "/admin",
    staff: "/dashboard",
    lender: "/lender",
    referrer: "/referrer",
  };

  if (!role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to={redirectForRole[role]} replace />;
}

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppRoot />,
        children: [
          {
            index: true,
            element: <RoleRedirect />,
          },
          {
            path: "/dashboard",
            element: <ProtectedRoute roles={["admin", "staff"]}>
              <DashboardPage />
            </ProtectedRoute>,
          },
          {
            path: "/pipeline",
            element: <ProtectedRoute roles={["admin", "staff"]}>
              <PipelinePage />
            </ProtectedRoute>,
          },
          {
            path: "/contacts",
            element: <ProtectedRoute roles={["admin", "staff"]}>
              <ContactsPage />
            </ProtectedRoute>,
          },
          {
            path: "/companies",
            element: <ProtectedRoute roles={["admin", "staff"]}>
              <CompaniesPage />
            </ProtectedRoute>,
          },
          {
            path: "/documents",
            element: <ProtectedRoute roles={["admin", "staff"]}>
              <DocumentsPage />
            </ProtectedRoute>,
          },
          {
            path: "/marketing",
            element: <ProtectedRoute roles={["admin", "staff"]}>
              <MarketingPage />
            </ProtectedRoute>,
          },
          {
            path: "/analytics",
            element: <ProtectedRoute roles={["admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>,
          },
          {
            path: "/admin",
            element: <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>,
          },
          {
            path: "/settings",
            element: <ProtectedRoute roles={["admin"]}>
              <SettingsPage />
            </ProtectedRoute>,
          },
          {
            path: "/lender/*",
            element: (
              <ProtectedRoute roles={["lender"]}>
                <LenderPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "/referrer/*",
            element: (
              <ProtectedRoute roles={["referrer"]}>
                <ReferrerPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
