import { useEffect, useState } from "react";

interface ContinuationApp {
  id: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry: string;
  yearsInBusiness?: string;
  monthlyRevenue?: string;
  annualRevenue?: string;
  arOutstanding?: string;
  existingDebt?: string;
  createdAt: string;
}

export default function ContinuationApplications() {
  const [apps, setApps] = useState<ContinuationApp[]>([]);

  useEffect(() => {
    fetch("/api/continuation")
      .then((res) => res.json())
      .then(setApps);
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Capital Readiness / Continuations</h1>

      <div className="grid gap-4">
        {apps.map((app) => (
          <div key={app.id} className="rounded border bg-white p-4 shadow">
            <div className="text-lg font-semibold">{app.companyName}</div>
            <div>{app.fullName}</div>
            <div>{app.email}</div>
            <div>{app.phone}</div>
            <div className="mt-2 text-sm text-gray-500">Industry: {app.industry}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
