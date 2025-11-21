import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/auth/LoginPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import DealsPage from "@/pages/deals/DealsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import AdminPage from "@/pages/roles/AdminPage";
import LenderPage from "@/pages/roles/LenderPage";
import ReferrerPage from "@/pages/roles/ReferrerPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="deals" element={<DealsPage />} />

            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
            <Route element={<ProtectedRoute role="lender" />}>
              <Route path="lender" element={<LenderPage />} />
            </Route>
            <Route element={<ProtectedRoute role="referrer" />}>
              <Route path="referrer" element={<ReferrerPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
