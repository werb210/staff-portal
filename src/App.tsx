import React, { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthContext, AuthProvider } from "@/auth/AuthContext";
import { usePortalSessionGuard } from "@/auth/portalSessionGuard";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LendersPage from "@/pages/Lenders";
import AuthProbe from "@/tests/components/AuthProbe";

function SessionGuard() {
  usePortalSessionGuard();
  return null;
}

const AppRoutes = () => (
  <BrowserRouter>
    <SessionGuard />
    {process.env.NODE_ENV === "test" ? <AuthProbe /> : null}
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lenders/*"
        element={
          <ProtectedRoute>
            <LendersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default function App() {
  const existingAuthContext = useContext(AuthContext);

  if (existingAuthContext) {
    return <AppRoutes />;
  }

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
