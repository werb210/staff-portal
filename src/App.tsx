import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "./lib/auth/ProtectedRoute";
import { Layout } from "./lib/ui/layout/Layout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Layout>
              <div>Applications Page</div>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Layout>
              <div>Contacts Page</div>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lenders"
        element={
          <ProtectedRoute>
            <Layout>
              <div>Lender Management</div>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <div>Reports Page</div>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
