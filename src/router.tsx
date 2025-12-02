import { createBrowserRouter } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ApplicationPage from './pages/ApplicationPage';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/auth/RequireAuth';
import CommunicationsPage from './pages/CommunicationsPage';
import DocumentManagerPage from './pages/DocumentManagerPage';
import LenderAdminPage from './pages/LenderAdminPage';
import RoleManagementPage from './pages/Admin/RoleManagementPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    )
  },
  {
    path: "/applications/:id",
    element: (
      <RequireAuth>
        <ApplicationPage />
      </RequireAuth>
    )
  },
  {
    path: "/application/:id/documents",
    element: (
      <RequireAuth>
        <DocumentManagerPage />
      </RequireAuth>
    )
  },
  {
    path: "/communications",
    element: (
      <RequireAuth>
        <CommunicationsPage />
      </RequireAuth>
    )
  },
  {
    path: "/admin/lenders",
    element: (
      <RequireAuth>
        <LenderAdminPage />
      </RequireAuth>
    )
  },
  {
    path: "/admin/roles",
    element: (
      <RequireAuth>
        <RoleManagementPage />
      </RequireAuth>
    )
  },
  {
    path: "/admin/users",
    element: (
      <RequireAuth>
        <AdminUsersPage />
      </RequireAuth>
    )
  }
]);

export default router;
