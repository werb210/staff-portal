import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layout/AppLayout";

import LoginPage from "../screens/LoginPage";
import DashboardHome from "../screens/DashboardHome";
import ApplicationsPage from "../screens/ApplicationsPage";
import OCRPage from "../screens/OCRPage";
import UsersPage from "../screens/UsersPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="search" element={<OCRPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<div>TODO Settings</div>} />
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
