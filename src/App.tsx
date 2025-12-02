import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./state/authStore";
import { useEffect } from "react";
import GlobalSearch from "./components/search/GlobalSearch";
import useGlobalSearchShortcut from "./hooks/useGlobalSearchShortcut";
import NotificationToasts from "./components/notifications/NotificationToasts";
import { initWebSocket } from "./ws/client";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import Pipeline from "./pages/Pipeline";
import Documents from "./pages/Documents";
import Lenders from "./pages/Lenders";
import AuditLogPage from "./pages/Admin/AuditLogPage";
import RoleManagementPage from "./pages/Admin/RoleManagementPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  const restore = useAuthStore((s) => s.restore);
  const user = useAuthStore((s) => s.user);

  useGlobalSearchShortcut();

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (user) initWebSocket();
  }, [user]);

  return (
    <BrowserRouter>
      <GlobalSearch />
      <NotificationToasts />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/contacts"
          element={
            <RequireAuth>
              <Contacts />
            </RequireAuth>
          }
        />
        <Route
          path="/companies"
          element={
            <RequireAuth>
              <Companies />
            </RequireAuth>
          }
        />
        <Route
          path="/deals"
          element={
            <RequireAuth>
              <Deals />
            </RequireAuth>
          }
        />
        <Route
          path="/pipeline"
          element={
            <RequireAuth>
              <Pipeline />
            </RequireAuth>
          }
        />
        <Route
          path="/documents"
          element={
            <RequireAuth>
              <Documents />
            </RequireAuth>
          }
        />
        <Route
          path="/lenders"
          element={
            <RequireAuth>
              <Lenders />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <RequireAdmin>
              <AuditLogPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RequireAdmin>
              <RoleManagementPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminUsersPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
