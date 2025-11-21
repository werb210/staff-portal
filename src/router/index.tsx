import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "../App";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const userRole = "staff";

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface PageTemplateProps {
  title: string;
  description?: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title, description }) => (
  <main className="min-h-screen bg-white text-slate-900">
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Staff Portal</p>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
      </header>
    </div>
  </main>
);

const LoginPage = () => (
  <PageTemplate title="Login" description="Access your staff portal account to continue." />
);

const ContactsPage = () => (
  <PageTemplate title="Contacts" description="Manage and review your contacts in one place." />
);

const CompaniesPage = () => (
  <PageTemplate title="Companies" description="Track company records and related activity." />
);

const DealsPage = () => (
  <PageTemplate title="Deals" description="Monitor deal stages and collaboration progress." />
);

const ApplicationsPage = () => (
  <PageTemplate title="Applications" description="Review and process incoming applications." />
);

const DocumentsPage = () => (
  <PageTemplate title="Documents" description="Organize and access key documentation." />
);

const SearchPage = () => (
  <PageTemplate title="Search" description="Find records across the staff portal." />
);

const TagsPage = () => (
  <PageTemplate title="Tags" description="Categorize and label items for faster discovery." />
);

const PipelinePage = () => (
  <PageTemplate title="Pipeline" description="Visualize progress through your operational pipeline." />
);

const ReportsPage = () => (
  <PageTemplate title="Reports" description="Analyze performance and outcomes." />
);

const SettingsPage = () => (
  <PageTemplate title="Settings" description="Configure your preferences and account settings." />
);

export const AppRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "/contacts",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <ContactsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/companies",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <CompaniesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/deals",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <DealsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/applications",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <ApplicationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/documents",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <DocumentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <SearchPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tags",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <TagsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pipeline",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <PipelinePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <ReportsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
]);
