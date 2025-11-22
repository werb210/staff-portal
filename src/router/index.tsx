import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import { AdminLayout } from "@/layouts/AdminLayout";
import ApplicationsPage from "@/pages/ApplicationsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import ContactsPage from "@/pages/ContactsPage";
import DealsPage from "@/pages/DealsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import PipelinePage from "@/pages/PipelinePage";
import ReportsPage from "@/pages/ReportsPage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import TagsPage from "@/pages/TagsPage";
import { Protected, RoleGuard } from "./guards";

const LoginPage = React.lazy(() => import("@/pages/auth/LoginPage"));

const protectedElement = (
  <Protected>
    <AdminLayout />
  </Protected>
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
      { path: "dashboard", element: <App /> },
      {
        path: "admin",
        element: (
          <RoleGuard role="admin">
            <App />
          </RoleGuard>
        ),
      },
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
