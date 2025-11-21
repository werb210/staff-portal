import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import AuthInitializer from "@/providers/AuthInitializer";
import { QueryProvider } from "@/providers/QueryProvider";
import { router } from "@/router/AppRouter";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </QueryProvider>
  </React.StrictMode>
);
