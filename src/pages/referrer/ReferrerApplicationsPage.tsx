import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { TableSkeleton } from "@/ui/skeletons";

interface ApplicationRow {
  id: string;
  referralName?: string;
  submittedOn?: string;
  stage?: string;
  amount?: number;
  status?: string;
  commission?: number;
}

export default function ReferrerApplicationsPage() {
  const query = useQuery({
    queryKey: ["referrer-applications"],
    queryFn: async () => {
      const res = await axios.get("/api/referrers/applications");
      return res.data as ApplicationRow[];
    },
  });

  if (query.isLoading) return <TableSkeleton />;

  const rows = query.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium tracking-tight">Applications</h1>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left font-medium">
            <tr>
              <th className="px-4 py-3">Referral name</th>
              <th className="px-4 py-3">Submitted on</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/referrer/applications/${row.id}`} className="text-blue-600">
                    {row.referralName}
                  </Link>
                </td>
                <td className="px-4 py-3">{row.submittedOn}</td>
                <td className="px-4 py-3">{row.stage}</td>
                <td className="px-4 py-3">{row.amount}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
