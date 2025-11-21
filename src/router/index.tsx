import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import CompaniesPage from "@/pages/Companies";
import ContactsPage from "@/pages/Contacts";
import Dashboard from "@/pages/Dashboard";
import DealsPage from "@/pages/deals/DealsPage";
import LoginPage from "@/pages/auth/LoginPage";
import PipelinePage from "@/pages/Pipeline";
import SearchPage from "@/features/search/SearchPage";
import TagsPage from "@/features/tags/TagsPage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/dashboard", element: <Dashboard /> },
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

export default router;
