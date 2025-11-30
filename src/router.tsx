import { createBrowserRouter } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ApplicationPage from './pages/ApplicationPage';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/auth/RequireAuth';
import CommunicationsPage from './pages/CommunicationsPage';

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
    path: "/communications",
    element: (
      <RequireAuth>
        <CommunicationsPage />
      </RequireAuth>
    )
  }
]);

export default router;
