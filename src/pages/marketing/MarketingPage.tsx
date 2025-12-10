import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { canAccessMarketing } from "@/utils/roles";
import MarketingDashboard from "./MarketingDashboard";

const MarketingPage = () => {
  const { user } = useAuth();
  const unauthorized = user && !canAccessMarketing(user.role);

  return (
    <div className="page">
      <Card title="Marketing">
        {unauthorized && <p>This space is limited to Administrators.</p>}
        {!unauthorized && <MarketingDashboard />}
      </Card>
    </div>
  );
};

export default MarketingPage;
