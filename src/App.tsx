import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import BICommissionDashboard from "./pages/bi/BICommissionDashboard";
import BIUnderwriting from "./pages/bi/BIUnderwriting";
import SLFPipeline from "./pages/slf/SLFPipeline";
import BFDashboard from "./pages/bf/BFDashboard";
import GlobalAdmin from "./pages/GlobalAdmin";
import AuditLogs from "./pages/AuditLogs";
import { useSilo } from "./context/SiloContext";
import type { Silo } from "./context/SiloContext";

const siloPaths: Record<Silo, string> = {
  bf: "/bf",
  bi: "/bi",
  slf: "/slf"
};

function SiloSync() {
  const location = useLocation();
  const { setSilo } = useSilo();

  useEffect(() => {
    const firstSegment = location.pathname.split("/")[1];
    if (firstSegment === "bf" || firstSegment === "bi" || firstSegment === "slf") {
      setSilo(firstSegment);
    }
  }, [location.pathname, setSilo]);

  return null;
}

export default function App() {
  const { silo } = useSilo();

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
          path="/admin/global"
          element={
            <ProtectedRoute requiredRole="admin">
              <GlobalAdmin />
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
