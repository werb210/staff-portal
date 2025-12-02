import React, { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";

export type CompanyForm = {
  id?: string;
  name: string;
  sector: string;
  city: string;
  stage: string;
};

type CompanyModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (company: CompanyForm) => void;
  initial?: CompanyForm | null;
};

export function CompanyModal({ open, onClose, onSave, initial }: CompanyModalProps) {
  const [form, setForm] = useState<CompanyForm>({ name: "", sector: "", city: "", stage: "Prospect" });

  useEffect(() => {
    if (initial) {
      setForm(initial);
    } else {
      setForm({ name: "", sector: "", city: "", stage: "Prospect" });
    }
  }, [initial]);

  const update = (key: keyof CompanyForm, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{initial ? "Edit" : "Add"} company</h3>
          <button className="text-sm text-slate-500" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            <span className="text-slate-600">Name</span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-slate-600">Sector</span>
            <input
              value={form.sector}
              onChange={(e) => update("sector", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-slate-600">City</span>
            <input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-slate-600">Stage</span>
            <select
              value={form.stage}
              onChange={(e) => update("stage", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            >
              <option>Prospect</option>
              <option>Active</option>
              <option>Closed</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className={cn(
              "rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500",
              !form.name && "opacity-60",
            )}
            onClick={handleSave}
            disabled={!form.name}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
