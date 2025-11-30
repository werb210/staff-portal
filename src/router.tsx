import { createBrowserRouter } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/auth/RequireAuth';

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
  }
]);

export default router;
