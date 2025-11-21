import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </ToastProvider>
  </React.StrictMode>
);
