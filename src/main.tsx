import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "@/router/AppRouter";
import AuthInitializer from "@/providers/AuthInitializer";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthInitializer>
      <AppRouter />
    </AuthInitializer>
  </React.StrictMode>
);
