import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import AppLoading from "@/components/layout/AppLoading";
import LenderCountWidget from "@/components/LenderCountWidget";
import CampaignRevenue from "@/components/CampaignRevenue";
import { useAuth } from "@/hooks/useAuth";

interface LenderMetrics {
  lenderName: string;
  submitted: number;
  approved: number;
  funded: number;
  avgFundedAmount: number;
  totalCommission: number;
}

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [lenderMetrics, setLenderMetrics] = useState<LenderMetrics[]>([]);

  useEffect(() => {
    fetch("/api/analytics/lender-performance")
      .then((res) => res.json())
      .then((data) => setLenderMetrics(data))
      .catch((err) => console.error(err));
  }, []);

  if (isLoading) {
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RequireRole roles={["Admin", "Staff"]}>
      <div className="page">
        <div className="kpi-grid mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lenderMetrics.map((lender) => {
            const approvalRate = lender.submitted
              ? ((lender.approved / lender.submitted) * 100).toFixed(1)
              : 0;

            const fundedRate = lender.submitted
              ? ((lender.funded / lender.submitted) * 100).toFixed(1)
              : 0;

            return (
              <div key={lender.lenderName} className="kpi-card">
                <Card title={lender.lenderName}>
                  <p>Approval Rate: {approvalRate}%</p>
                  <p>Funded Rate: {fundedRate}%</p>
                  <p>Avg Funded: ${lender.avgFundedAmount}</p>
                  <p>Total Commission: ${lender.totalCommission}</p>
                </Card>
              </div>
            );
          })}
        </div>
        <Card title="Dashboard Overview">
          <p>Welcome to the Staff Portal. Select a silo to tailor your workflow.</p>
          <div className="mt-3 text-sm text-slate-700">
            <LenderCountWidget />
          </div>
        </Card>
        <div className="campaign-revenue-section mt-4">
          <Card title="Revenue by Campaign">
            <CampaignRevenue />
          </Card>
        </div>
      </div>
    </RequireRole>
  );
};

export default DashboardPage;
