import { Route, Routes, Link } from "react-router-dom";
import BIPipeline from "./pipeline/BIPipeline";
import BIReports from "./reports/BIReports";
import BICRM from "./crm/BICRM";
import BILenderPortal from "./lender/BILenderPortal";
import BIApplicationDetail from "./pipeline/BIApplicationDetail";
import CommissionReport from "./reports/CommissionReport";

export default function BISilo() {
  return (
    <div>
      <h1>Boreal Insurance</h1>
      <nav>
        <Link to="pipeline">Pipeline</Link> | <Link to="crm">CRM</Link> |{" "}
        <Link to="reports">Reports</Link> |{" "}
        <Link to="lender">Lender Portal</Link>
      </nav>

      <Routes>
        <Route path="pipeline" element={<BIPipeline />} />
        <Route path="pipeline/:id" element={<BIApplicationDetail />} />
        <Route path="crm" element={<BICRM />} />
        <Route path="reports" element={<BIReports />} />
        <Route path="reports/commission" element={<CommissionReport />} />
        <Route path="lender" element={<BILenderPortal />} />
      </Routes>
    </div>
  );
}
