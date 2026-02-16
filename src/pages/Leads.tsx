import { useEffect, useState } from "react";
import { fetchLeads } from "@/lib/leads";
import type { Lead } from "@/types/lead";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchLeads();
      setLeads(data);
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Incoming Leads</h1>

      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Industry</th>
              <th className="p-3">Years</th>
              <th className="p-3">Annual Revenue</th>
              <th className="p-3">Monthly Revenue</th>
              <th className="p-3">A/R</th>
              <th className="p-3">Collateral</th>
              <th className="p-3">Status</th>
              <th className="p-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b">
                <td className="p-3">{lead.companyName}</td>
                <td className="p-3">{lead.contactName}</td>
                <td className="p-3">{lead.email}</td>
                <td className="p-3">{lead.phone}</td>
                <td className="p-3">{lead.industry || "-"}</td>
                <td className="p-3">{lead.yearsInBusiness || "-"}</td>
                <td className="p-3">{lead.annualRevenue || "-"}</td>
                <td className="p-3">{lead.monthlyRevenue || "-"}</td>
                <td className="p-3">{lead.arBalance || "-"}</td>
                <td className="p-3">{lead.collateral || "-"}</td>
                <td className="p-3">{lead.status || "-"}</td>
                <td className="p-3">{lead.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
