import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import MarketingDashboard from "./MarketingDashboard";

const MarketingPage = () => {
  return (
    <RequireRole roles={["ADMIN"]} message="This space is limited to Administrators.">
      <div className="page">
        <Card title="Marketing">
          <MarketingDashboard />
        </Card>
      </div>
    </RequireRole>
  );
};

export default MarketingPage;
