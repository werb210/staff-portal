import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import StaffLayout from "../layouts/StaffLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Lazy-loaded Pipeline page — folder import resolves to pages/Pipeline/index.tsx
const PipelinePage = lazy(() => import("../pages/Pipeline"));

/**
 * STAFF PORTAL — PIPELINE ROUTES
 *
 * FINAL ARCHITECTURE:
 *
 * /pipeline            => PipelinePage (board)
 * /pipeline/:id        => PipelinePage (board + drawer)
 *
 * IMPORTANT:
 * - StaffLayout must NOT re-mount for "/pipeline/:id"
 * - ProtectedRoute stays above StaffLayout
 * - Only ONE element = <PipelinePage /> inside this module
 */

const pipelineRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          {
            path: "/pipeline",
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
        ],
      },
    ],
  },
];

export default pipelineRoutes;
