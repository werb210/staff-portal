import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "./router/PrivateRoute";
import LoginPage from "./pages/login/LoginPage";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ApplicationsPage from "./pages/applications/ApplicationsPage";
import CRMPage from "./pages/crm/CRMPage";
import CommunicationsPage from "./pages/communications/CommunicationsPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import MarketingPage from "./pages/marketing/MarketingPage";
import LendersPage from "./pages/lenders/LendersPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TaskPane from "./pages/tasks/TaskPane";
import ApiConfigGuard from "./components/layout/ApiConfigGuard";
import { notifyRouteChange } from "./api/client";
import { AuthProvider } from "./auth/AuthContext";

const RouteChangeObserver = () => {
  const location = useLocation();

  useEffect(() => {
    notifyRouteChange();
  }, [location.key]);

  return null;
};

const ProtectedApp = () => (
  <AuthProvider>
    <ApiConfigGuard>
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    </ApiConfigGuard>
  </AuthProvider>
);

export default function App() {
  return (
    <BrowserRouter>
      <RouteChangeObserver />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedApp />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/communications" element={<CommunicationsPage />} />
          <Route path="/comms" element={<CommunicationsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TaskPane />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/lenders" element={<LendersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
