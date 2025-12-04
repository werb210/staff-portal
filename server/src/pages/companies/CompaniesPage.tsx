import { useEffect, useState } from "react";
import { listCompanies, createCompany, Company } from "@/api/companies";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", phone: "" });

  async function load() {
    setLoading(true);
    try {
      const data = await listCompanies();
      setCompanies(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    if (!form.name.trim()) return;
    await createCompany({
      name: form.name,
      industry: form.industry || undefined,
      phone: form.phone || undefined,
    });
    setShowCreate(false);
    setForm({ name: "", industry: "", phone: "" });
    load();
  }

  return (
    <div>
      <h1>Companies</h1>

      <button onClick={() => setShowCreate(true)}>Add Company</button>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{(c as any).industry ?? ""}</td>
                <td>{(c as any).phone ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <div className="modal">
          <h2>Create Company</h2>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <button onClick={submit}>Save</button>
          <button onClick={() => setShowCreate(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
