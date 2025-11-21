import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { useAuthSync } from "@/hooks/useAuthSync";
import { router } from "@/router";
import { useAuthStore } from "@/store/useAuthStore";
import "./index.css";

useAuthStore.getState().hydrate();

function App() {
  useAuthSync();
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
