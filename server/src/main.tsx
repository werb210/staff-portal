import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AppRouter from "./router";
import "./index.css";
import GlobalLoader from "./components/GlobalLoader";
import ErrorToast from "./components/ErrorToast";
import NotificationStreamProvider from "./context/NotificationStreamProvider";
import MessageStreamProvider from "./context/MessageStreamProvider";

const rootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationStreamProvider>
        <MessageStreamProvider>
          <AppRouter />
          <GlobalLoader />
          <ErrorToast />
        </MessageStreamProvider>
      </NotificationStreamProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
