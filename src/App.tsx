import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import DealsPage from "@/pages/deals/DealsPage";
import LayoutShell from "@/components/layout/LayoutShell";

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <Protected>
                <LayoutShell />
              </Protected>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="deals" element={<DealsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
