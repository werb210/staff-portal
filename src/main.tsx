import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AppRouter from "./router";
import "./index.css";
import GlobalLoader from "./components/GlobalLoader";
import ErrorToast from "./components/ErrorToast";

const rootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <GlobalLoader />
      <ErrorToast />
    </QueryClientProvider>
  </React.StrictMode>
);
