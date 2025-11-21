import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import ContactsPage from "../pages/contacts/ContactsPage";
import CompaniesPage from "../pages/companies/CompaniesPage";
import DealsPage from "../pages/deals/DealsPage";
import PipelinePage from "../pages/pipeline/PipelinePage";
import TagsPage from "../pages/tags/TagsPage";
import SearchPage from "../pages/search/SearchPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/contacts", element: <ContactsPage /> },
      { path: "/companies", element: <CompaniesPage /> },
      { path: "/deals", element: <DealsPage /> },
      { path: "/pipeline", element: <PipelinePage /> },
      { path: "/tags", element: <TagsPage /> },
      { path: "/search", element: <SearchPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
