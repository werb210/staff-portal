import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import ClientsPage from "./pages/clients/ClientsPage";

import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />

        <Route
          path="/clients"
          element={
            <AppLayout>
              <ClientsPage />
            </AppLayout>
          }
        />

        <Route
          path="/admin"
          element={
            <AppLayout>
              <AdminPanel />
            </AppLayout>
          }
        />

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
