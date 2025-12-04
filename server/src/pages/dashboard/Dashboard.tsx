import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats } from "@/api/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div>Loading dashboard…</div>;

  return (
    <div className="dashboard-grid">
      <div className="card">Total Companies: {stats.totalCompanies}</div>
      <div className="card">Total Contacts: {stats.totalContacts}</div>
      <div className="card">Total Deals: {stats.totalDeals}</div>
      <div className="card">Total Applications: {stats.totalApplications}</div>
    </div>
  );
}
