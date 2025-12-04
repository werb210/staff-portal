import { useQuery } from "@tanstack/react-query";
import { DashboardAPI } from "@/core/endpoints/dashboard.api";

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => DashboardAPI.summary(),
  });

  const summary = data ?? {
    openDeals: 0,
    pendingApplications: 0,
    unreadNotifications: 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Open Deals" value={summary.openDeals} />
        <StatCard label="Pending Applications" value={summary.pendingApplications} />
        <StatCard label="Unread Notifications" value={summary.unreadNotifications} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
