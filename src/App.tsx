import React, { useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthContext, AuthProvider } from "@/auth/AuthContext";
import { usePortalSessionGuard } from "@/auth/portalSessionGuard";
import IncomingCallModal from "@/components/IncomingCallModal";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { destroyVoice, initVoice } from "@/services/voiceService";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LendersPage from "@/pages/Lenders";
import AuthProbe from "@/tests/components/AuthProbe";

function SessionGuard() {
  usePortalSessionGuard();
  return null;
}

function VoiceBootstrap() {
  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    void initVoice();

    return () => {
      destroyVoice();
    };
  }, []);

  return null;
}

const AppRoutes = () => (
  <BrowserRouter>
    <SessionGuard />
    <VoiceBootstrap />
    <IncomingCallModal />
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
