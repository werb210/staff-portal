import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
