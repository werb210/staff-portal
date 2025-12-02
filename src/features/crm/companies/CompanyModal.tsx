import React, { useState, useEffect } from "react";
import { Company, CompanyForm } from "./types";

export default function CompanyModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CompanyForm) => void;
  initial?: Company | null;
}) {
  const [form, setForm] = useState<CompanyForm>({
    name: "",
    industry: "",
    phone: "",
    website: "",
    email: "",
    address: "",
    tags: [],
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        industry: initial.industry ?? "",
        phone: initial.phone ?? "",
        website: initial.website ?? "",
        email: initial.email ?? "",
        address: initial.address ?? "",
        tags: [...initial.tags],
      });
    }
  }, [initial]);

  if (!open) return null;

  const update = (key: keyof CompanyForm, val: any) =>
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
          {initial ? "Edit Company" : "New Company"}
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Company name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Website"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="rounded border px-3 py-2 text-sm col-span-2"
          />
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-slate-600 mb-1">Tags</div>

          <div className="flex gap-2">
            <input
              id="companyTagInput"
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
                    "companyTagInput"
                  ) as HTMLInputElement
                ).value = "";
              }}
              className="rounded bg-indigo-600 text-white px-3 text-sm"
            >
              Add
            </button>
          </div>

          <div className="flex gap-1 mt-2 flex-wrap">
            {form.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-green-100 text-green-700 px-2 py-[2px] text-xs font-medium flex items-center gap-1"
              >
                {t}
                <button
                  className="text-green-700"
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
            className="px-4 py-2 text-sm rounded bg-indigo-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
