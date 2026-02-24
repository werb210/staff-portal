import { Route, Routes, Link } from "react-router-dom";
import BIPipeline from "./pipeline/BIPipeline";
import BIReports from "./reports/BIReports";
import BICRM from "./crm/BICRM";

export default function BISilo() {
  return (
    <div>
      <h1>Boreal Insurance</h1>
      <nav>
        <Link to="pipeline">Pipeline</Link> | <Link to="crm">CRM</Link> |{" "}
        <Link to="reports">Reports</Link>
      </nav>

      <Routes>
        <Route path="pipeline" element={<BIPipeline />} />
        <Route path="crm" element={<BICRM />} />
        <Route path="reports" element={<BIReports />} />
      </Routes>
    </div>
  );
}
