import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import StaffLayout from "../layouts/StaffLayout";

// Lazy-loaded Pipeline page (folder import for index.tsx resolution)
const PipelinePage = lazy(() => import("../pages/Pipeline"));

/**
 * Pipeline Route Module
 *
 * This file defines the canonical routing for the Staff Pipeline feature.
 *
 * Routes:
 *   /pipeline          – full board
 *   /pipeline/:id      – board stays mounted, drawer opens for an application
 *
 * IMPORTANT:
 *  - StaffLayout wraps the entire authenticated portal
 *  - PipelinePage handles both board rendering and drawer logic
 *  - We do NOT mount PipelinePage twice
 */

const pipelineRoutes: RouteObject[] = [
  {
    path: "/pipeline",
    element: <StaffLayout />, // must match staff portal layout
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
