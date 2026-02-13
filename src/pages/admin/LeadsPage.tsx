import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Lead, LeadMetadata, LeadSource } from "@/types/crm";

type ApiLead = {
  id?: string;
  company?: string;
  companyName?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  industry?: string;
  source?: string;
  createdAt?: string;
  metadata?: LeadMetadata;
  yearsInBusiness?: string | number;
  revenue?: string | number;
  ar?: string | number;
  accountsReceivable?: string | number;
  existingDebt?: string | number;
  score?: string | number;
};

type LeadFilter = "all" | "website";

const normalizeSource = (source?: string): LeadSource => {
  if (source === "website_contact" || source === "website_credit_check" || source === "chat_start" || source === "startup_interest") {
    return source;
  }
  return "website_contact";
};

const toLead = (lead: ApiLead, index: number): Lead => {
  const firstName = lead.first_name ?? lead.firstName ?? "";
  const lastName = lead.last_name ?? lead.lastName ?? "";
  const fullName = lead.fullName ?? `${firstName} ${lastName}`.trim();

  return {
    id: lead.id ?? `${lead.email ?? "lead"}-${index}`,
    companyName: lead.companyName ?? lead.company ?? "-",
    fullName: fullName || "-",
    email: lead.email ?? "-",
    phone: lead.phone ?? "-",
    industry: lead.industry,
    source: normalizeSource(lead.source),
    createdAt: lead.createdAt ?? new Date().toISOString(),
    metadata: {
      yearsInBusiness: lead.metadata?.yearsInBusiness ?? lead.yearsInBusiness,
      revenue: lead.metadata?.revenue ?? lead.revenue,
      accountsReceivable: lead.metadata?.accountsReceivable ?? lead.accountsReceivable ?? lead.ar,
      existingDebt: lead.metadata?.existingDebt ?? lead.existingDebt,
      score: lead.metadata?.score ?? lead.score
    }
  };
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadFilter>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetch("/api/crm/leads")
      .then((res) => res.json())
      .then((data: ApiLead[] | { leads?: ApiLead[] }) => {
        const payload = Array.isArray(data) ? data : (data.leads ?? []);
        setLeads(payload.map(toLead));
      })
      .catch(() => setLeads([]));
  }, []);

  const websiteLeads = useMemo(
    () => leads.filter((l) => l.source === "website_contact" || l.source === "website_credit_check"),
    [leads]
  );

  const visibleLeads = filter === "website" ? websiteLeads : leads;

  if (user?.role !== "Admin") {
    return <div>Access denied</div>;
  }

  return (
    <div className="page space-y-4">
      <h1 className="text-xl font-semibold">Website Leads</h1>
      <div className="flex gap-2">
        <button onClick={() => setFilter("all")}>All Leads</button>
        <button onClick={() => setFilter("website")}>Website Leads</button>
      </div>
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
          {visibleLeads.map((lead) => (
            <tr key={lead.id} className="cursor-pointer border-t border-slate-100" onClick={() => setSelectedLead(lead)}>
              <td className="px-3 py-2">{lead.companyName}</td>
              <td className="px-3 py-2">{lead.fullName}</td>
              <td className="px-3 py-2">{lead.email}</td>
              <td className="px-3 py-2">{lead.phone}</td>
              <td className="px-3 py-2">
                <span className={`badge badge-${lead.source}`}>{lead.source.replace("_", " ")}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLead && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lead Details</h2>
            <button onClick={() => setSelectedLead(null)}>Close</button>
          </div>
          <div><strong>Company:</strong> {selectedLead.companyName}</div>
          <div><strong>Name:</strong> {selectedLead.fullName}</div>
          <div><strong>Email:</strong> {selectedLead.email}</div>
          <div><strong>Phone:</strong> {selectedLead.phone}</div>

          {selectedLead.metadata?.yearsInBusiness && (
            <div>
              <strong>Years in Business:</strong> {selectedLead.metadata.yearsInBusiness}
            </div>
          )}

          {selectedLead.metadata?.revenue && (
            <div>
              <strong>Revenue:</strong> {selectedLead.metadata.revenue}
            </div>
          )}

          {selectedLead.metadata?.accountsReceivable && (
            <div>
              <strong>A/R:</strong> {selectedLead.metadata.accountsReceivable}
            </div>
          )}

          {selectedLead.metadata?.existingDebt && (
            <div>
              <strong>Existing Debt:</strong> {selectedLead.metadata.existingDebt}
            </div>
          )}

          {selectedLead.metadata?.score && (
            <div>
              <strong>Preliminary Score:</strong> {selectedLead.metadata.score}
            </div>
          )}

          {selectedLead.source === "website_contact" && (
            <div className="text-sm text-green-600">SMS notification sent to intake specialist.</div>
          )}
        </div>
      )}
    </div>
  );
}
