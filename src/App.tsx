import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import AppLayout from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import ApplicationsListPage from "@/features/applications/ApplicationsListPage";
import ApplicationViewPage from "@/features/applications/ApplicationViewPage";

function Protected({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <Protected>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </Protected>
          }
        />

        <Route
          path="/applications"
          element={
            <Protected>
              <AppLayout>
                <ApplicationsListPage />
              </AppLayout>
            </Protected>
          }
        />

        <Route
          path="/applications/:id"
          element={
            <Protected>
              <AppLayout>
                <ApplicationViewPage />
              </AppLayout>
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
