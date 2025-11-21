import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import { queryClient } from "@/lib/queryClient";
import { appRouter } from "@/router";
import { useAuthStore } from "@/store/authStore";
import "@/index.css";

void useAuthStore.getState().loadFromStorage();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={appRouter} />
      </QueryClientProvider>
    </ToastProvider>
  </React.StrictMode>
);
