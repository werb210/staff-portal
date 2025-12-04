import { useEffect, useState } from "react";
import { CompaniesAPI } from "../../api/companies";

interface CompanyEditorProps {
  company: any;
}

export default function CompanyEditor({ company }: CompanyEditorProps) {
  const [form, setForm] = useState<any>(company);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(company);
  }, [company]);

  const update = async () => {
    const res = await CompaniesAPI.update(company.id, form);
    setForm(res.data ?? form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="company-editor flex flex-col gap-3 max-w-xl">
      <label className="text-sm text-gray-700">Name</label>
      <input
        className="border rounded px-3 py-2"
        value={form?.name || ""}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <label className="text-sm text-gray-700">Email</label>
      <input
        className="border rounded px-3 py-2"
        value={form?.email || ""}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <label className="text-sm text-gray-700">Phone</label>
      <input
        className="border rounded px-3 py-2"
        value={form?.phone || ""}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <label className="text-sm text-gray-700">Industry</label>
      <input
        className="border rounded px-3 py-2"
        value={form?.industry || ""}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
      />

      <label className="text-sm text-gray-700">Website</label>
      <input
        className="border rounded px-3 py-2"
        value={form?.website || ""}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
      />

      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={update}>
        Save
      </button>
      {saved && <div className="saved-banner text-green-700">Saved!</div>}
    </div>
  );
}
