import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AIKnowledgeManager from "@/pages/admin/AIKnowledgeManager";
import SupportDashboard from "@/pages/admin/SupportDashboard";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/ai" element={<AIKnowledgeManager />} />
      <Route path="/admin/support" element={<SupportDashboard />} />
      <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
    </Routes>
  );
}
