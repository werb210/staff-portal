import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import PipelinePage from "@/features/pipeline/PipelinePage";
import ContactsPage from "@/pages/Contacts";
import ContactDetailPage from "@/pages/contacts/ContactDetailPage";
import Companies from "@/pages/Companies";
import CompanyDetailPage from "@/pages/companies/CompanyDetailPage";
import DocumentCenter from "@/pages/documents/DocumentCenter";
import DocumentDetailsPage from "@/pages/documents/DocumentDetailsPage";
import ForbiddenPage from "@/pages/Forbidden";
import ProtectedRoute from "./ProtectedRoute";
import LenderLoginPage from "@/pages/lender/LenderLoginPage";
import LenderLayout from "@/pages/lender/LenderLayout";
import LenderProductsPage from "@/pages/lender/LenderProductsPage";
import LenderProductDetailPage from "@/pages/lender/LenderProductDetailPage";
import LenderReportsPage from "@/pages/lender/LenderReportsPage";
import ReferrerLoginPage from "@/pages/referrer/ReferrerLoginPage";
import ReferrerLayout from "@/pages/referrer/ReferrerLayout";
import ReferrerDashboardPage from "@/pages/referrer/ReferrerDashboardPage";
import ReferrerApplicationsPage from "@/pages/referrer/ReferrerApplicationsPage";
import ReferrerApplicationDetailPage from "@/pages/referrer/ReferrerApplicationDetailPage";
import ReferrerPerformancePage from "@/pages/referrer/ReferrerPerformancePage";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/lender/login",
    element: <LenderLoginPage />,
  },
  {
    path: "/referrer/login",
    element: <ReferrerLoginPage />,
  },
  {
    path: "/forbidden",
    element: <ForbiddenPage />,
  },
  {
    element: (
      <ProtectedRoute allow={["admin", "staff", "marketing"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/pipeline", element: <PipelinePage /> },
      { path: "/contacts", element: <ContactsPage /> },
      { path: "/contacts/:id", element: <ContactDetailPage /> },
      { path: "/companies", element: <Companies /> },
      { path: "/companies/:id", element: <CompanyDetailPage /> },
      { path: "/documents", element: <DocumentCenter /> },
      { path: "/documents/:id", element: <DocumentDetailsPage /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
  {
    path: "/lender",
    element: (
      <ProtectedRoute allow={["lender"]}>
        <LenderLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/lender/products" replace /> },
      { path: "/lender/products", element: <LenderProductsPage /> },
      { path: "/lender/products/:id", element: <LenderProductDetailPage /> },
      { path: "/lender/reports", element: <LenderReportsPage /> },
    ],
  },
  {
    path: "/referrer",
    element: (
      <ProtectedRoute allow={["referrer"]}>
        <ReferrerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/referrer/dashboard" replace /> },
      { path: "/referrer/dashboard", element: <ReferrerDashboardPage /> },
      { path: "/referrer/applications", element: <ReferrerApplicationsPage /> },
      { path: "/referrer/applications/:id", element: <ReferrerApplicationDetailPage /> },
      { path: "/referrer/performance", element: <ReferrerPerformancePage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
