import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import PipelinePage from "../features/pipeline/PipelinePage";
import ApplicationsPage from "../features/applications/ApplicationsPage";
import DocumentsPage from "../features/documents/DocumentsPage";
import LendersPage from "../features/lenders/LendersPage";
import OcrInsightsPage from "../features/ocr/OcrInsightsPage";
import SearchPage from "../features/search/SearchPage";
import TagsPage from "../features/tags/TagsPage";

import AppShell from "../components/layout/AppShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "lenders", element: <LendersPage /> },
      { path: "ocr", element: <OcrInsightsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "tags", element: <TagsPage /> }
    ]
  }
]);
