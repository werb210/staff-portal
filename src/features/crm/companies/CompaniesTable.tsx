import React, { useState } from "react";
import { Company } from "./types";

export default function CompaniesTable({
  companies,
  onEdit,
}: {
  companies: Company[];
  onEdit: (c: Company) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = companies.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q) ||
      (c.website ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Search companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 border-b">
            <th className="py-2">Company</th>
            <th>Industry</th>
            <th>Website</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="border-b last:border-none">
              <td className="py-2 font-medium">{c.name}</td>
              <td>{c.industry ?? "—"}</td>
              <td>{c.website ?? "—"}</td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-emerald-100 text-emerald-700 px-2 py-[2px] text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className="text-right">
                <button
                  onClick={() => onEdit(c)}
                  className="text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-slate-500">
                No companies found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
