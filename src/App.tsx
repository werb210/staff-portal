import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardPage from "./pages/dashboard/DashboardPage";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
