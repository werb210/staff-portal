import { useEffect, useMemo, useState } from "react";
import { CompaniesAPI } from "../../api/companies";

interface CompanyRow {
  id: string;
  name: string;
  industry?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

export default function CompaniesTable() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await CompaniesAPI.list();
    setCompanies(r.data || []);
    setLoading(false);
  };

  const runSearch = async () => {
    if (!query.trim()) return load();
    setLoading(true);
    const r = await CompaniesAPI.search(query);
    setCompanies(r.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => companies ?? [], [companies]);

  if (loading) return <div>Loading companies…</div>;

  return (
    <div className="companies-table space-y-4">
      <div className="search-row flex gap-2 items-center">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={query}
          placeholder="Search companies…"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={runSearch}>
          Search
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="text-left bg-gray-50">
            <th className="p-3">Company</th>
            <th className="p-3">Industry</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Email</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.industry || "—"}</td>
              <td className="p-3">{c.phone || "—"}</td>
              <td className="p-3">{c.email || "—"}</td>
              <td className="p-3">
                <a className="text-blue-600 hover:underline" href={`/companies/${c.id}`}>
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
