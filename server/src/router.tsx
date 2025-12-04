// src/router.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import LoginPage from "./pages/auth/LoginPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetail from "./pages/CompanyDetail";
import ProductsPage from "./pages/ProductsPage";
import TasksPage from "./pages/TasksPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import Pipeline from "./pages/Pipeline";
import PipelineDetail from "@/pages/PipelineDetail";
import AdminDashboard from "./pages/AdminDashboard";

export default function AppRouter() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        {token ? (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/pipeline/:id" element={<PipelineDetail />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
