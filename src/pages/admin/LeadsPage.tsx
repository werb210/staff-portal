import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type Lead = {
  company?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  source?: string;
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/crm/leads")
      .then((res) => res.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setLeads([]));
  }, []);

  if (user?.role !== "Admin") {
    return <div>Access denied</div>;
  }

  return (
    <div className="page space-y-4">
      <h1 className="text-xl font-semibold">Website Leads</h1>
      <table className="min-w-full divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Phone</th>
            <th className="px-3 py-2 text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={`${lead.email ?? "lead"}-${i}`} className="border-t border-slate-100">
              <td className="px-3 py-2">{lead.company ?? "-"}</td>
              <td className="px-3 py-2">{lead.first_name} {lead.last_name}</td>
              <td className="px-3 py-2">{lead.email ?? "-"}</td>
              <td className="px-3 py-2">{lead.phone ?? "-"}</td>
              <td className="px-3 py-2" style={{ color: lead.source === "exit_intent" ? "red" : "black" }}>
                {lead.source ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

