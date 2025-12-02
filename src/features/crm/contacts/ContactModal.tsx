import React, { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";

export type ContactForm = {
  id?: string;
  name: string;
  email: string;
  company: string;
  tags: string[];
};

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (contact: ContactForm) => void;
  initial?: ContactForm | null;
};

export function ContactModal({ open, onClose, onSave, initial }: ContactModalProps) {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", company: "", tags: [] });

  useEffect(() => {
    if (initial) {
      setForm(initial);
    } else {
      setForm({ name: "", email: "", company: "", tags: [] });
    }
  }, [initial]);

  const updateField = (key: keyof ContactForm, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{initial ? "Edit" : "Add"} contact</h3>
          <button className="text-sm text-slate-500" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            <span className="text-slate-600">Name</span>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-slate-600">Email</span>
            <input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-slate-600">Company</span>
            <input
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-slate-600">Tags (comma separated)</span>
            <input
              value={form.tags.join(", ")}
              onChange={(e) => updateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
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
            onClick={handleSubmit}
            disabled={!form.name}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
