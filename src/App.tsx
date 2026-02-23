import { useSilo } from "./context/SiloContext";
import BIDashboard from "./pages/bi/BIDashboard";
import SLFDashboard from "./pages/slf/SLFDashboard";
import BFDashboard from "./pages/bf/BFDashboard";

export default function App() {
  const { silo } = useSilo();

  if (silo === "BI") return <BIDashboard />;
  if (silo === "SLF") return <SLFDashboard />;
  return <BFDashboard />;
}
