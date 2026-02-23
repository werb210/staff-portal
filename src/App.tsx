import { useSilo } from "./context/SiloContext";
import { useAuth } from "./context/AuthContext";
import BICommissionDashboard from "./pages/bi/BICommissionDashboard";
import SLFPipeline from "./pages/slf/SLFPipeline";
import BFDashboard from "./pages/bf/BFDashboard";

export default function App() {
  const { silo } = useSilo();
  const { role } = useAuth();

  if (silo === "SLF" && role !== "admin") {
    return <div>Access Restricted</div>;
  }

  if (silo === "BI") return <BICommissionDashboard />;
  if (silo === "SLF") return <SLFPipeline />;

  return <BFDashboard />;
}
