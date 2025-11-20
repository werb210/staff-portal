import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";

import LoginPage from "../features/auth/LoginPage";
import AppLayout from "../layouts/AppLayout";
import Unauthorized from "../pages/Unauthorized";

import DashboardPage from "../pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <RoleGuard allow={["admin", "staff"]}>
            <DashboardPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);
