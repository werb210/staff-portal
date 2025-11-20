import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ApplicationsPage from "./pages/dashboard/ApplicationsPage";
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import LendersPage from "./pages/dashboard/LendersPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="lenders" element={<LendersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
