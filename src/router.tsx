import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import CRM from "./pages/crm/CRM";
import Pipeline from "./pages/pipeline/Pipeline";

import UsersAdmin from "./pages/admin/UsersAdmin";
import AuditAdmin from "./pages/admin/AuditAdmin";

import LenderProducts from "./pages/lender/LenderProducts";
import LenderReports from "./pages/lender/LenderReports";

import ReferrerReferrals from "./pages/referrer/ReferrerReferrals";
import ReferrerPerformance from "./pages/referrer/ReferrerPerformance";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/crm", element: <CRM /> },
          { path: "/pipeline", element: <Pipeline /> },

          {
            element: <ProtectedRoute roles={["admin"]} />,
            children: [
              { path: "/admin/users", element: <UsersAdmin /> },
              { path: "/admin/audit", element: <AuditAdmin /> },
            ],
          },

          {
            element: <ProtectedRoute roles={["lender"]} />,
            children: [
              { path: "/lender/products", element: <LenderProducts /> },
              { path: "/lender/reports", element: <LenderReports /> },
            ],
          },

          {
            element: <ProtectedRoute roles={["referrer"]} />,
            children: [
              { path: "/referrer/referrals", element: <ReferrerReferrals /> },
              { path: "/referrer/performance", element: <ReferrerPerformance /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <LoginPage /> },
]);
