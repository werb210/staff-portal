import { Navigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import AppLoading from "@/components/layout/AppLoading";
import LenderCountWidget from "@/components/LenderCountWidget";
import { useAuth } from "@/hooks/useAuth";

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RequireRole roles={["Admin", "Staff"]}>
      <div className="page">
        <Card title="Dashboard Overview">
          <p>Welcome to the Staff Portal. Select a silo to tailor your workflow.</p>
          <div className="mt-3 text-sm text-slate-700">
            <LenderCountWidget />
          </div>
        </Card>
      </div>
    </RequireRole>
  );
};

export default DashboardPage;
