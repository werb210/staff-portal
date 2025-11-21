import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import PipelinePage from "@/features/pipeline/PipelinePage";
import ContactsPage from "@/pages/Contacts";
import DocumentDetailsPage from "@/pages/documents/DocumentDetailsPage";
import ContactDetailPage from "@/pages/contacts/ContactDetailPage";
import Companies from "@/pages/Companies";
import CompanyDetailPage from "@/pages/companies/CompanyDetailPage";
import DocumentCenter from "@/pages/documents/DocumentCenter";
import ForbiddenPage from "@/pages/Forbidden";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/pipeline" replace />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/documents" element={<DocumentCenter />} />
          <Route path="/documents/:id" element={<DocumentDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
