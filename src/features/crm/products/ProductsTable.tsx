import React, { useState } from "react";
import { Product } from "./types";

export default function ProductsTable({
  products,
  onEdit,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 border-b">
            <th className="py-2">Name</th>
            <th>Category</th>
            <th>Amount Range</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="border-b last:border-none">
              <td className="py-2 font-medium">{p.name}</td>
              <td>{p.category ?? "—"}</td>
              <td>
                {p.minAmount && p.maxAmount
                  ? `$${p.minAmount.toLocaleString()}–$${p.maxAmount.toLocaleString()}`
                  : "—"}
              </td>
              <td>
                <div className="flex gap-1 flex-wrap">
                  {p.tags.map((t) => (
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
                  onClick={() => onEdit(p)}
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
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
