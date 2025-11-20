import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";

import DashboardPage from "../features/dashboard/DashboardPage";
import UnauthorizedPage from "../features/errors/UnauthorizedPage";
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
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
