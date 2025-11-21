import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../layouts/DashboardLayout";

// Screens
import LoginPage from "../screens/LoginPage";
import DashboardHome from "../screens/DashboardHome";
import UsersPage from "../screens/UsersPage";
import ApplicationsPage from "../screens/ApplicationsPage";
import OCRPage from "../screens/OCRPage";
import TagsPage from "../screens/TagsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="ocr" element={<OCRPage />} />
        <Route path="tags" element={<TagsPage />} />
      </Route>
    </Routes>
  );
}
