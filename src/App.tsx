import { Navigate, Route, Routes } from "react-router-dom";
import { isLoggedIn } from "./lib/auth";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/login/LoginPage";
import { AppShell } from "./components/layout/AppShell";
import DashboardPage from "./pages/dashboard/DashboardPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC AUTH ROUTE */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>

      {/* PROTECTED APP ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* CATCH-ALL → ROOT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
