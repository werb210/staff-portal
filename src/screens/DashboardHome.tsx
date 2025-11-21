import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../api/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function DashboardHome() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading dashboard…</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Failed to load dashboard. Check the server connection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Applications" value={data.applications} />
        <StatCard title="Tags" value={data.tags} />
        <StatCard title="OCR Items" value={data.ocr} />
        <StatCard title="Users" value={data.users} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}
