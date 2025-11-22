import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";

import { Protected } from "@/router/guards";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import DealsPage from "@/pages/deals/DealsPage";
import SearchPage from "@/pages/search/SearchPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import PipelinePage from "@/pages/pipeline/PipelinePage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "pipeline", element: <PipelinePage /> }
    ]
  }
]);

export default router;
