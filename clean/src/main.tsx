import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "./components/ui/toast";
import { queryClient } from "./lib/queryClient";
import { authStore } from "./modules/auth/auth.store";
import AppRouter from "./AppRouter";
import "./index.css";

async function bootstrap() {
  await authStore.getState().refresh();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={AppRouter} />
        </QueryClientProvider>
      </ToastProvider>
    </React.StrictMode>
  );
}

void bootstrap();
