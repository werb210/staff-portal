import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppRoot from "@/components/layout/AppRoot";
import LoginPage from "@/pages/auth/LoginPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import DealsPage from "@/pages/deals/DealsPage";
import DocumentsPage from "@/pages/documents/DocumentsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import PipelinePage from "@/pages/pipeline/PipelinePage";
import TagsPage from "@/pages/tags/TagsPage";
import SearchPage from "@/pages/search/SearchPage";
import OcrPage from "@/pages/ocr/OcrPage";
import AdminPage from "@/pages/roles/AdminPage";
import LenderPage from "@/pages/roles/LenderPage";
import ReferrerPage from "@/pages/roles/ReferrerPage";
import { authStore, Role } from "@/lib/auth/authStore";

interface ProtectedRouteProps {
  roles?: Role[];
  children: ReactNode;
}

function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = authStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && (!user || !roles.includes(user.role)))
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={(
          <ProtectedRoute>
            <AppRoot />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/ocr" element={<OcrPage />} />
        <Route
          path="/admin"
          element={(
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/lender"
          element={(
            <ProtectedRoute roles={["lender"]}>
              <LenderPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/referrer"
          element={(
            <ProtectedRoute roles={["referrer"]}>
              <ReferrerPage />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
