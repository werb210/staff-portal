import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RoleGuard from "../components/RoleGuard";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import PipelineModule from "../features/pipeline";
import UnauthorizedPage from "../features/errors/UnauthorizedPage";
import UsersModule from "../features/users";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../features/errors/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "pipeline/*",
        element: (
          <RoleGuard allow={["admin", "staff"]}>
            <PipelineModule />
          </RoleGuard>
        ),
      },
      {
        path: "users/*",
        element: (
          <RoleGuard allow={["admin"]}>
            <UsersModule />
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
