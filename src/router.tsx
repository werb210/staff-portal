import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import CRM from "./pages/crm/CRM";
import Pipeline from "./pages/pipeline/Pipeline";

import UsersAdmin from "./pages/admin/UsersAdmin";
import AuditAdmin from "./pages/admin/AuditAdmin";

import LenderProducts from "./pages/lender/LenderProducts";
import LenderReports from "./pages/lender/LenderReports";

import ReferrerReferrals from "./pages/referrer/ReferrerReferrals";
import ReferrerPerformance from "./pages/referrer/ReferrerPerformance";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* All protected pages */}
        <Route path="/*" element={<MainLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="crm" element={<CRM />} />
          <Route path="pipeline" element={<Pipeline />} />

          <Route path="admin/users" element={<UsersAdmin />} />
          <Route path="admin/audit" element={<AuditAdmin />} />

          <Route path="lender/products" element={<LenderProducts />} />
          <Route path="lender/reports" element={<LenderReports />} />

          <Route path="referrer/referrals" element={<ReferrerReferrals />} />
          <Route path="referrer/performance" element={<ReferrerPerformance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
