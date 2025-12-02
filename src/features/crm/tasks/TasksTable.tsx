import React, { useState } from "react";
import { Task } from "./types";

export default function TasksTable({
  tasks,
  onEdit,
}: {
  tasks: Task[];
  onEdit: (t: Task) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = tasks.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.status ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 border-b">
            <th className="py-2">Title</th>
            <th>Status</th>
            <th>Due</th>
            <th>Assigned To</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((t) => (
            <tr key={t.id} className="border-b last:border-none">
              <td className="py-2 font-medium">{t.title}</td>
              <td className="capitalize">{t.status.replace("_", " ")}</td>
              <td>{t.dueDate ?? "—"}</td>
              <td>{t.assignedTo ?? "—"}</td>
              <td className="text-right">
                <button
                  onClick={() => onEdit(t)}
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
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
