import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "../App";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { AdminLayout } from "../layouts/AdminLayout";

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
  badge?: string;
  children?: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title, description, badge, children }) => (
  <div className="space-y-4">
    <div className="space-y-1">
      {badge ? <Badge>{badge}</Badge> : null}
      <h1 className="text-2xl font-bold">{title}</h1>
      {description ? <p className="text-slate-600">{description}</p> : null}
    </div>
    {children ? (
      children
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Content coming soon</CardTitle>
          <CardDescription>
            This section of the portal is ready to host tools, tables, and visualizations using the new UI primitives.
          </CardDescription>
        </CardHeader>
      </Card>
    )}
  </div>
);

const LoginPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="space-y-1">
        <Badge>Staff Portal</Badge>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-slate-600">Access your staff portal account to continue.</p>
      </div>
      <Alert variant="info">
        <AlertTitle>Demo mode</AlertTitle>
        <AlertDescription>Sign-in flow is simulated for this preview.</AlertDescription>
      </Alert>
      <div className="grid gap-3">
        <Button>Continue</Button>
        <Button variant="secondary">Use single sign-on</Button>
      </div>
    </div>
  </main>
);

const ContactsPage = () => (
  <PageTemplate
    title="Contacts"
    description="Manage and review your contacts in one place."
    badge="Data integrity"
  />
);

const CompaniesPage = () => (
  <PageTemplate title="Companies" description="Track company records and related activity." badge="Entities" />
);

const DealsPage = () => (
  <PageTemplate title="Deals" description="Monitor deal stages and collaboration progress." badge="Pipeline" />
);

const ApplicationsPage = () => (
  <PageTemplate title="Applications" description="Review and process incoming applications." badge="Workflows" />
);

const DocumentsPage = () => (
  <PageTemplate title="Documents" description="Organize and access key documentation." badge="Compliance" />
);

const SearchPage = () => (
  <PageTemplate title="Search" description="Find records across the staff portal." badge="Discovery" />
);

const TagsPage = () => (
  <PageTemplate title="Tags" description="Categorize and label items for faster discovery." badge="Taxonomy" />
);

const PipelinePage = () => (
  <PageTemplate title="Pipeline" description="Visualize progress through your operational pipeline." badge="Operations" />
);

const ReportsPage = () => (
  <PageTemplate title="Reports" description="Analyze performance and outcomes." badge="Insights" />
);

const SettingsPage = () => (
  <PageTemplate title="Settings" description="Configure your preferences and account settings." badge="Profile" />
);

const protectedElement = (
  <ProtectedRoute allowedRoles={["admin", "staff"]}>
    <AdminLayout />
  </ProtectedRoute>
);

export const AppRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: protectedElement,
    children: [
      { index: true, element: <App /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "tags", element: <TagsPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
