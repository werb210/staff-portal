import { createBrowserRouter, Navigate } from "react-router-dom";
import { Protected } from "@/router/guards";
import Layout from "@/components/layout/Layout";

import LoginPage from "@/pages/auth/LoginPage";
import Dashboard from "@/pages/dashboard/Dashboard";
import ContactsPage from "@/pages/contacts/ContactsPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import DealsPage from "@/pages/deals/DealsPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import ApplicationDetailPage from "@/pages/applications/ApplicationDetailPage";
import PipelinePage from "@/pages/pipeline/PipelinePage";
import AuditLogPage from "@/pages/Admin/AuditLogPage";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },

  {
    path: "/",
    element: (
      <Protected>
        <Layout />
      </Protected>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "applications/:id", element: <ApplicationDetailPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "admin/audit", element: <AuditLogPage /> }
    ]
  },

  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
