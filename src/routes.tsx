import { createBrowserRouter } from "react-router-dom";

// Layouts
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth
import LoginPage from "./pages/auth/LoginPage";

// Dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";

// CRM
import ContactsPage from "./pages/crm/ContactsPage";
import CompaniesPage from "./pages/crm/CompaniesPage";
import DealsPage from "./pages/crm/DealsPage";
import TasksPage from "./pages/crm/TasksPage";
import ActivityPage from "./pages/crm/ActivityPage";

// Pipeline
import PipelinePage from "./pages/pipeline/PipelinePage";
import ApplicationDetailPage from "./pages/pipeline/ApplicationDetailPage";

// Lenders
import LenderProductsPage from "./pages/lenders/LenderProductsPage";
import LenderEditorPage from "./pages/lenders/LenderEditorPage";

// Referrers
import ReferrersPage from "./pages/referrers/ReferrersPage";
import ReferrerDetailPage from "./pages/referrers/ReferrerDetailPage";

// Tools
import OcrToolPage from "./pages/tools/OcrToolPage";
import BankingToolPage from "./pages/tools/BankingToolPage";
import DocumentRepairPage from "./pages/tools/DocumentRepairPage";

// Settings
import UsersPage from "./pages/settings/UsersPage";
import SettingsPage from "./pages/settings/SettingsPage";

// Error
import NotFoundPage from "./pages/errors/NotFoundPage";

// Route guard
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  // AUTH
  {
    path: "/login",
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },

  // APP LAYOUT + PROTECTED ROUTES
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      { index: true, element: <DashboardPage /> },

      // CRM
      { path: "crm/contacts", element: <ContactsPage /> },
      { path: "crm/companies", element: <CompaniesPage /> },
      { path: "crm/deals", element: <DealsPage /> },
      { path: "crm/tasks", element: <TasksPage /> },
      { path: "crm/activity", element: <ActivityPage /> },

      // Pipeline
      { path: "pipeline", element: <PipelinePage /> },
      {
        path: "applications/:id",
        element: <ApplicationDetailPage />,
      },

      // Lenders
      { path: "lenders", element: <LenderProductsPage /> },
      { path: "lenders/:id", element: <LenderEditorPage /> },

      // Referrers
      { path: "referrers", element: <ReferrersPage /> },
      { path: "referrers/:id", element: <ReferrerDetailPage /> },

      // Tools
      { path: "tools/ocr", element: <OcrToolPage /> },
      { path: "tools/banking", element: <BankingToolPage /> },
      { path: "tools/document-repair", element: <DocumentRepairPage /> },

      // Settings
      { path: "settings", element: <SettingsPage /> },
      { path: "settings/users", element: <UsersPage /> },
    ],
  },

  // 404
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
