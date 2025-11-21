import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/ui/skeletons";

export default function ReferrerDashboardPage() {
  const query = useQuery({
    queryKey: ["referrer-stats"],
    queryFn: async () => {
      const res = await axios.get("/api/referrers/stats");
      return res.data ?? {};
    },
  });

  if (query.isLoading) return <PageSkeleton />;

  const stats = query.data;

  const widgets = [
    { label: "Total referrals", value: stats.totalReferrals },
    { label: "Active referrals", value: stats.activeReferrals },
    { label: "Funded deals", value: stats.fundedDeals },
    { label: "Commission earned", value: stats.commissionEarned },
    { label: "Leaderboard position", value: stats.leaderboardPosition },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium tracking-tight">Referrer Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <Card key={widget.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium tracking-tight">{widget.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{widget.value ?? "-"}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
