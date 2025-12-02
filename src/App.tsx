import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./state/authStore";
import { useEffect } from "react";
import GlobalSearch from "./components/search/GlobalSearch";
import useGlobalSearchShortcut from "./hooks/useGlobalSearchShortcut";
import NotificationToasts from "./components/notifications/NotificationToasts";
import { initWebSocket } from "./ws/client";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import Pipeline from "./pages/Pipeline";
import Documents from "./pages/Documents";
import Lenders from "./pages/Lenders";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const user = useAuthStore((s) => s.user);

  useGlobalSearchShortcut();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) initWebSocket();
  }, [user]);

  return (
    <BrowserRouter>
      <GlobalSearch />
      <NotificationToasts />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <Companies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals"
          element={
            <ProtectedRoute>
              <Deals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute>
              <Pipeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lenders"
          element={
            <ProtectedRoute>
              <Lenders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
