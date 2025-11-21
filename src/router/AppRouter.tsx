import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";

// PAGES
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import ContactsPage from "@/pages/contacts/ContactsPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import DealsPage from "@/pages/deals/DealsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";

// ROLE-BASED PROTECTED ROUTE
function Protected({ children, roles }: { children: any; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED CONTENT */}
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="deals" element={<DealsPage />} />

          {/* ADMIN-ONLY EXAMPLES (UNCOMMENT AFTER ADMIN PAGES EXIST)
          <Route
            path="admin"
            element={
              <Protected roles={['admin']}>
                <AdminDashboardPage />
              </Protected>
            }
          />
          */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
