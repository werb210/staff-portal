import { createBrowserRouter } from "react-router-dom";
import AppRoot from "@/components/layout/AppRoot";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import CompaniesPage from "@/pages/companies/CompaniesPage";
import DealsPage from "@/pages/deals/DealsPage";
import Protected from "@/components/auth/Protected";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <AppRoot />
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals", element: <DealsPage /> }
    ],
  }
]);
