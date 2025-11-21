import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

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

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/search" element={<OCRPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
