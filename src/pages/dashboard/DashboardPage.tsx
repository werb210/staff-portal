import { Navigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import AppLoading from "@/components/layout/AppLoading";
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
        </Card>
      </div>
    </RequireRole>
  );
};

export default DashboardPage;
