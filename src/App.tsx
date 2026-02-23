import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import BICommissionDashboard from "./pages/bi/BICommissionDashboard";
import BIUnderwriting from "./pages/bi/BIUnderwriting";
import SLFPipeline from "./pages/slf/SLFPipeline";
import BFDashboard from "./pages/bf/BFDashboard";
import GlobalAdmin from "./pages/GlobalAdmin";
import AuditLogs from "./pages/AuditLogs";
import CommissionDetail from "./pages/CommissionDetail";
import AdminActivity from "./pages/AdminActivity";
import { useSilo } from "./context/SiloContext";
import type { Silo } from "./context/SiloContext";
import { useAuth } from "./context/AuthContext";
import AccessRestricted from "./components/auth/AccessRestricted";

const siloPaths: Record<Silo, string> = {
  bf: "/bf",
  bi: "/bi",
  slf: "/slf"
};

function SiloSync() {
  const location = useLocation();
  const { setSilo } = useSilo();
  const { canAccessSilo } = useAuth();

  useEffect(() => {
    const firstSegment = location.pathname.split("/")[1];
    if ((firstSegment === "bf" || firstSegment === "bi" || firstSegment === "slf") && canAccessSilo(firstSegment)) {
      setSilo(firstSegment);
    }
  }, [location.pathname, setSilo, canAccessSilo]);

  return null;
}

export default function App() {
  const { silo } = useSilo();
  const location = useLocation();
  const { canAccessSilo } = useAuth();
  const requestedSilo = location.pathname.split("/")[1];
  const isSiloPath = requestedSilo === "bf" || requestedSilo === "bi" || requestedSilo === "slf";

  if (isSiloPath && !canAccessSilo(requestedSilo)) {
    return <AccessRestricted message="You cannot access this silo." />;
  }

  return (
    <>
      <SiloSync />
      <Routes>
        <Route path="/" element={<Navigate to={siloPaths[silo]} replace />} />
        <Route
          path="/bf"
          element={
            <ProtectedRoute>
              <BFDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bi"
          element={
            <ProtectedRoute>
              <div>
                <BIUnderwriting />
                <BICommissionDashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/slf"
          element={
            <ProtectedRoute requiredRole="admin">
              <SLFPipeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bi/commissions/:policyId"
          element={
            <ProtectedRoute>
              <CommissionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/global"
          element={
            <ProtectedRoute requiredRole="admin">
              <GlobalAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute requiredRole="admin">
              <AuditLogs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
