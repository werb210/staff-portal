import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

// Lazy-loaded Pipeline page
const PipelinePage = lazy(() => import("../pages/Pipeline"));

/**
 * Pipeline Route Module
 *
 * This file isolates all routes for the Pipeline feature:
 *   /pipeline
 *   /pipeline/:id  (drawer opened through state)
 *
 * This matches the Staff Portal architecture for modular routing.
 */
const pipelineRoutes: RouteObject[] = [
  {
    path: "/pipeline",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <PipelinePage />,
      },
      {
        path: ":id",
        element: <PipelinePage />,
      },
    ],
  },
];

export default pipelineRoutes;
