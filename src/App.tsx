import { useSilo } from "./context/SiloContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BICommissionDashboard from "./pages/bi/BICommissionDashboard";
import BIUnderwriting from "./pages/bi/BIUnderwriting";
import SLFPipeline from "./pages/slf/SLFPipeline";
import BFDashboard from "./pages/bf/BFDashboard";

export default function App() {
  const { silo } = useSilo();

  if (silo === "BI") {
    return (
      <ProtectedRoute requiredRole="admin">
        <div>
          <BIUnderwriting />
          <BICommissionDashboard />
        </div>
      </ProtectedRoute>
    );
  }

  if (silo === "SLF") {
    return (
      <ProtectedRoute requiredRole="admin">
        <SLFPipeline />
      </ProtectedRoute>
    );
  }

  return <BFDashboard />;
}
