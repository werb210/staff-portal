import { Navigate, createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/auth/LoginPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import Dashboard from "@/pages/dashboard/Dashboard";
import DealsPage from "@/pages/deals/DealsPage";
import PipelinePage from "@/pages/pipeline/PipelinePage";
import SearchPage from "@/pages/search/SearchPage";
import TagsPage from "@/pages/tags/TagsPage";
import { QueryProvider } from "@/providers/QueryProvider";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <QueryProvider>
            <Layout />
          </QueryProvider>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "contacts", element: <ContactsPage /> },
          { path: "companies", element: <CompaniesPage /> },
          { path: "deals", element: <DealsPage /> },
          { path: "pipeline", element: <PipelinePage /> },
          { path: "tags", element: <TagsPage /> },
          { path: "search", element: <SearchPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
