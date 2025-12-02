import React, { useState, useEffect } from "react";
import { Product, ProductForm } from "./types";

export default function ProductModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductForm) => void;
  initial?: Product | null;
}) {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    category: "",
    description: "",
    minAmount: undefined,
    maxAmount: undefined,
    tags: [],
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category ?? "",
        description: initial.description ?? "",
        minAmount: initial.minAmount,
        maxAmount: initial.maxAmount,
        tags: [...initial.tags],
      });
    }
  }, [initial]);

  if (!open) return null;

  const update = (key: keyof ProductForm, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addTag = (t: string) => {
    if (!t.trim() || form.tags.includes(t.trim())) return;
    update("tags", [...form.tags, t.trim()]);
  };

  const removeTag = (t: string) =>
    update(
      "tags",
      form.tags.filter((x) => x !== t)
    );

  let tagInput = "";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {initial ? "Edit Product" : "New Product"}
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Product name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Min Amount"
            value={form.minAmount ?? ""}
            onChange={(e) => update("minAmount", Number(e.target.value))}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Max Amount"
            value={form.maxAmount ?? ""}
            onChange={(e) => update("maxAmount", Number(e.target.value))}
            className="rounded border px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="rounded border px-3 py-2 text-sm col-span-2"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-slate-600 mb-1">Tags</div>

          <div className="flex gap-2">
            <input
              id="productTagInput"
              type="text"
              placeholder="Add tag"
              onChange={(e) => (tagInput = e.target.value)}
              className="rounded border px-3 py-2 text-sm flex-1"
            />
            <button
              onClick={() => {
                addTag(tagInput);
                (
                  document.getElementById(
                    "productTagInput"
                  ) as HTMLInputElement
                ).value = "";
              }}
              className="rounded bg-emerald-600 text-white px-3 text-sm"
            >
              Add
            </button>
          </div>

          <div className="flex gap-1 mt-2 flex-wrap">
            {form.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-emerald-100 text-emerald-700 px-2 py-[2px] text-xs font-medium flex items-center gap-1"
              >
                {t}
                <button
                  className="text-emerald-700"
                  onClick={() => removeTag(t)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border bg-white"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 text-sm rounded bg-emerald-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
