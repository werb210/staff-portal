import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AppRouter from "./router";
import "./index.css";
import GlobalLoader from "./components/GlobalLoader";
import ErrorToast from "./components/ErrorToast";
import NotificationStreamProvider from "./context/NotificationStreamProvider";

const rootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationStreamProvider>
        <AppRouter />
        <GlobalLoader />
        <ErrorToast />
      </NotificationStreamProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
