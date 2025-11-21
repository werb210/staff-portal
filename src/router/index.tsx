import React from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";

import App from "../App";
import { AdminLayout } from "../layouts/AdminLayout";
import ApplicationsPage from "../pages/ApplicationsPage";
import CompaniesPage from "../pages/CompaniesPage";
import ContactsPage from "../pages/ContactsPage";
import DealsPage from "../pages/DealsPage";
import DocumentsPage from "../pages/DocumentsPage";
import PipelinePage from "../pages/PipelinePage";
import ReportsPage from "../pages/ReportsPage";
import SearchPage from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import TagsPage from "../pages/TagsPage";
import { useAuthStore } from "../core/auth.store";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const from = `${location.pathname}${location.search}`;

  if (!accessToken) {
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return <>{children}</>;
};

const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));

const protectedElement = (
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
);

export const AppRouter = createBrowserRouter([
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
    element: protectedElement,
    children: [
      { index: true, element: <App /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "tags", element: <TagsPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
