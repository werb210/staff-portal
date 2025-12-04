import { createBrowserRouter, Navigate } from "react-router-dom";
import { Protected } from "@/router/guards";
import MainLayout from "@/layout/MainLayout";

import LoginPage from "@/pages/auth/LoginPage";
import Dashboard from "@/pages/dashboard/Dashboard";
import ContactsPage from "@/pages/contacts/ContactsPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import DealsPage from "@/pages/deals/DealsPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import ApplicationDetailPage from "@/pages/applications/ApplicationDetailPage";
import PipelinePage from "@/pages/pipeline/PipelinePage";
import Documents from "@/pages/Documents";
import Lenders from "@/pages/Lenders";
import Marketing from "@/pages/Marketing";
import Referrals from "@/pages/Referrals";
import AdminUsersPage from "@/pages/Admin/AdminUsersPage";
import AuditLogPage from "@/pages/Admin/AuditLogPage";
import Unauthorized from "@/pages/Unauthorized";

export const appRouter = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: (
      <Protected>
        <MainLayout />
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
      { path: "documents", element: <Documents /> },
      { path: "lenders", element: <Lenders /> },
      { path: "marketing", element: <Marketing /> },
      { path: "referrals", element: <Referrals /> },
      { path: "admin/users", element: <AdminUsersPage /> },
      { path: "admin/audit", element: <AuditLogPage /> }
    ]
  },

  { path: "/unauthorized", element: <Unauthorized /> },

  { path: "*", element: <Navigate to="/" replace /> }
]);
