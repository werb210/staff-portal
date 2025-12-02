import React, { useMemo, useState } from "react";
import { CompanyModal, CompanyForm } from "./CompanyModal";

type Company = CompanyForm & { id: string };

const mockCompanies: Company[] = [
  { id: "co1", name: "Northwind", sector: "Food & Bev", city: "Calgary", stage: "Active" },
  { id: "co2", name: "Prairie Freight", sector: "Transport", city: "Edmonton", stage: "Prospect" },
  { id: "co3", name: "Aurora Dental", sector: "Healthcare", city: "Vancouver", stage: "Active" },
  { id: "co4", name: "Sprout Grocers", sector: "Retail", city: "Winnipeg", stage: "Closed" },
];

export default function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [filterStage, setFilterStage] = useState("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    return companies
      .filter((c) => (filterStage === "all" ? true : c.stage === filterStage))
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.city.toLowerCase().includes(query.toLowerCase()));
  }, [companies, filterStage, query]);

  const handleSave = (company: CompanyForm) => {
    if (company.id) {
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? (company as Company) : c)));
    } else {
      setCompanies((prev) => [...prev, { ...(company as CompanyForm), id: crypto.randomUUID() }]);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Companies</h3>
          <p className="text-sm text-slate-600">Local CRM table for organizations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search name or city"
            className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
          >
            <option value="all">All stages</option>
            <option value="Prospect">Prospect</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Add company
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-700">Sector</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-700">City</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-700">Stage</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{company.name}</td>
                <td className="px-4 py-3 text-slate-700">{company.sector}</td>
                <td className="px-4 py-3 text-slate-700">{company.city}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{company.stage}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-semibold text-indigo-600" onClick={() => { setEditing(company); setModalOpen(true); }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompanyModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
    </div>
  );
}
