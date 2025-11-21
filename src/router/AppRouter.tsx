import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppRoot from "@/components/layout/AppRoot";
import LoginPage from "@/pages/auth/LoginPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import DealsPage from "@/pages/deals/DealsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import AdminPage from "@/pages/roles/AdminPage";
import LenderPage from "@/pages/roles/LenderPage";
import ReferrerPage from "@/pages/roles/ReferrerPage";
import { Role, useAuthStore } from "@/store/auth";

function HomeRedirect() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "lender") return <Navigate to="/lender" replace />;
  if (role === "referrer") return <Navigate to="/referrer" replace />;

  return <Navigate to="/dashboard" replace />;
}

function RoleProtected({ roles }: { roles: Exclude<Role, null>[] }) {
  return <ProtectedRoute roles={roles} />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppRoot />,
        children: [
          {
            index: true,
            element: <HomeRedirect />,
          },
          {
            path: "dashboard",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <DashboardPage /> }],
          },
          {
            path: "pipeline",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <DealsPage /> }],
          },
          {
            path: "contacts",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <ContactsPage /> }],
          },
          {
            path: "companies",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <CompaniesPage /> }],
          },
          {
            path: "deals",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <DealsPage /> }],
          },
          {
            path: "documents",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <DealsPage /> }],
          },
          {
            path: "marketing",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <DashboardPage /> }],
          },
          {
            path: "analytics",
            element: <RoleProtected roles={["admin", "staff"]} />,
            children: [{ index: true, element: <DashboardPage /> }],
          },
          {
            path: "admin",
            element: <RoleProtected roles={["admin"]} />,
            children: [{ index: true, element: <AdminPage /> }],
          },
          {
            path: "lender",
            element: <RoleProtected roles={["lender"]} />,
            children: [{ index: true, element: <LenderPage /> }],
          },
          {
            path: "referrer",
            element: <RoleProtected roles={["referrer"]} />,
            children: [{ index: true, element: <ReferrerPage /> }],
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
