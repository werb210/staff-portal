import { Navigate, createBrowserRouter } from "react-router-dom";
import AppRoot from "./components/layout/AppRoot";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import CompaniesPage from "./pages/companies/CompaniesPage";
import ContactsPage from "./pages/contacts/ContactsPage";
import DashboardPage from "./pages/dashboard/Dashboard";
import DealsPage from "./pages/deals/DealsPage";
import ApplicationsPage from "./pages/applications/ApplicationsPage";
import PipelinePage from "./pages/pipeline/PipelinePage";
import TagsPage from "./pages/tags/TagsPage";
import SearchPage from "./pages/search/SearchPage";
import AdminPage from "./pages/roles/AdminPage";
import LenderPage from "./pages/roles/LenderPage";
import ReferrerPage from "./pages/roles/ReferrerPage";

const AppRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppRoot />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "contacts",
        element: <ContactsPage />,
      },
      {
        path: "companies",
        element: <CompaniesPage />,
      },
      {
        path: "deals",
        element: <DealsPage />,
      },
      {
        path: "pipeline",
        element: <PipelinePage />,
      },
      {
        path: "applications",
        element: <ApplicationsPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "tags",
        element: <TagsPage />,
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "lender",
        element: (
          <ProtectedRoute roles={["lender"]}>
            <LenderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "referrer",
        element: (
          <ProtectedRoute roles={["referrer"]}>
            <ReferrerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default AppRouter;
