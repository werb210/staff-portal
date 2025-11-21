import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminPanel from "./pages/admin/AdminPanel";

import { Protected } from "./routes/protected";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* STAFF */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminPanel />
            </Protected>
          }
        />

        {/* DEFAULT → login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
