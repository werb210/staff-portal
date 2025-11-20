// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

