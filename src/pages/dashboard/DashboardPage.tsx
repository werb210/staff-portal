import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";

const DashboardPage = () => (
  <RequireRole roles={["ADMIN", "STAFF"]}>
    <div className="page">
      <Card title="Dashboard Overview">
        <p>Welcome to the Staff Portal. Select a silo to tailor your workflow.</p>
      </Card>
    </div>
  </RequireRole>
);

export default DashboardPage;
