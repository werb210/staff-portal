import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import AppLoading from "@/components/layout/AppLoading";
import LenderCountWidget from "@/components/LenderCountWidget";
import CampaignRevenue from "@/components/CampaignRevenue";
import CommissionTrendChart from "@/components/CommissionTrendChart";
import { useAuth } from "@/hooks/useAuth";

interface LenderMetrics {
  lenderName: string;
  submitted: number;
  approved: number;
  funded: number;
  avgFundedAmount: number;
  totalCommission: number;
}

interface RevenueSummary {
  totalFunded: number;
  totalCommission: number;
  avgCommissionPerDeal: number;
  totalApplications: number;
  fundedDeals: number;
}

interface LeadIntelligence {
  id: string;
  companyName: string;
  requestedAmount: number;
  revenueTier: "high" | "medium" | "low";
  underwritingReadiness: "ready" | "partial" | "low";
  sessionId: string;
  createdAt: string;
}

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [lenderMetrics, setLenderMetrics] = useState<LenderMetrics[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(
    null,
  );
  const [priorityLeads, setPriorityLeads] = useState<LeadIntelligence[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    fetch("/api/analytics/revenue-summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setRevenueSummary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    fetch("/api/analytics/lender-performance", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setLenderMetrics(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    fetch("/api/analytics/priority-leads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const revenueScore = { high: 3, medium: 2, low: 1 };
        const readinessScore = { ready: 3, partial: 2, low: 1 };

        const sorted = data.sort((a: LeadIntelligence, b: LeadIntelligence) => {
          return (
            revenueScore[b.revenueTier] - revenueScore[a.revenueTier] ||
            readinessScore[b.underwritingReadiness] -
              readinessScore[a.underwritingReadiness]
          );
        });

        setPriorityLeads(sorted);
      })
      .catch(console.error);
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
        {revenueSummary && (
          <div className="executive-kpi-grid mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="kpi-card">
              <Card title="Total Funded">
                <p>${revenueSummary.totalFunded.toLocaleString()}</p>
              </Card>
            </div>

            <div className="kpi-card">
              <Card title="Total Commission">
                <p>${revenueSummary.totalCommission.toLocaleString()}</p>
              </Card>
            </div>

            <div className="kpi-card">
              <Card title="Avg Commission / Deal">
                <p>${revenueSummary.avgCommissionPerDeal.toLocaleString()}</p>
              </Card>
            </div>

            <div className="kpi-card">
              <Card title="Funded Rate">
                <p>
                  {(
                    (revenueSummary.fundedDeals /
                      revenueSummary.totalApplications) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </Card>
            </div>
          </div>
        )}

        <div className="priority-queue-section mb-4">
          <Card title="Priority Lead Queue">
            {priorityLeads.some((lead) => lead.revenueTier === "high") && (
              <div style={{ color: "#00ff88", marginBottom: "10px" }}>
                High-Value Leads Waiting for Action
              </div>
            )}

            {priorityLeads.map((lead) => (
              <div
                key={lead.id}
                className={`priority-card ${lead.revenueTier}`}
                style={{
                  border:
                    lead.revenueTier === "high"
                      ? "2px solid #00ff88"
                      : "1px solid #ccc",
                  padding: "12px",
                  marginBottom: "8px",
                }}
              >
                <h4>{lead.companyName}</h4>
                <p>Requested: ${lead.requestedAmount.toLocaleString()}</p>
                <p>Revenue Tier: {lead.revenueTier}</p>
                <p>Readiness: {lead.underwritingReadiness}</p>
                <p>Session ID: {lead.sessionId}</p>
              </div>
            ))}
          </Card>
        </div>

        <div className="campaign-roi-section mb-4">
          <Card title="Campaign ROI Snapshot">
            <CampaignRevenue />
          </Card>
        </div>

        <div className="commission-trend-section mb-4">
          <Card title="Commission Trend (30 Days)">
            <CommissionTrendChart />
          </Card>
        </div>

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
      </div>
    </RequireRole>
  );
};

export default DashboardPage;
