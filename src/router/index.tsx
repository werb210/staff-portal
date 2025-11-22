import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { RoleGuard } from "../components/auth/RoleGuard";
import { ComingSoon } from "../components/layout/ComingSoon";
import { AdminLayout } from "../layouts/AdminLayout";
import ApplicationsPage from "../pages/ApplicationsPage";
import CompaniesPage from "../pages/CompaniesPage";
import ContactsPage from "../pages/ContactsPage";
import DashboardPage from "../pages/DashboardPage";
import DealsPage from "../pages/DealsPage";
import DocumentsPage from "../pages/DocumentsPage";
import PipelinePage from "../pages/PipelinePage";
import ReportsPage from "../pages/ReportsPage";
import SearchPage from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import TagsPage from "../pages/TagsPage";

const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <React.Suspense fallback={<div className="p-6 text-center text-slate-600">Loading...</div>}>
        <LoginPage />
      </React.Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "marketing", element: <ComingSoon feature="Marketing" /> },
      { path: "admin", element: (
        <RoleGuard allowedRoles={["admin"]}>
          <ComingSoon feature="Admin" />
        </RoleGuard>
      ) },
      { path: "analytics", element: <ComingSoon feature="Analytics" /> },
      { path: "lender/*", element: (
        <RoleGuard allowedRoles={["admin", "lender"]}>
          <ComingSoon feature="Lender workspace" />
        </RoleGuard>
      ) },
      { path: "referrer/*", element: (
        <RoleGuard allowedRoles={["admin", "referrer"]}>
          <ComingSoon feature="Referrer workspace" />
        </RoleGuard>
      ) },
      { path: "search", element: <SearchPage /> },
      { path: "tags", element: <TagsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

export default router;
