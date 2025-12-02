import React, { useState } from "react";
import { Contact } from "./types";

export default function ContactsTable({
  contacts,
  onEdit,
}: {
  contacts: Contact[];
  onEdit: (c: Contact) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = contacts.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <input
          type="text"
          placeholder="Search contacts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 border-b">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="border-b last:border-none">
              <td className="py-2 font-medium">
                {c.firstName} {c.lastName}
              </td>
              <td>{c.email}</td>
              <td>{c.company ?? "—"}</td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-indigo-100 text-indigo-700 px-2 py-[2px] text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className="text-right">
                <button
                  onClick={() => onEdit(c)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-slate-500">
                No contacts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
