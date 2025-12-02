import React, { useState, useEffect } from "react";
import { Contact, ContactForm } from "./types";

export default function ContactModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactForm) => void;
  initial?: Contact | null;
}) {
  const [form, setForm] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    title: "",
    tags: [],
  });

  useEffect(() => {
    if (initial) {
      setForm({
        firstName: initial.firstName,
        lastName: initial.lastName,
        company: initial.company ?? "",
        email: initial.email ?? "",
        phone: initial.phone ?? "",
        title: initial.title ?? "",
        tags: [...initial.tags],
      });
    }
  }, [initial]);

  if (!open) return null;

  const update = (key: keyof ContactForm, val: any) =>
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
          {initial ? "Edit Contact" : "New Contact"}
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Company"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
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
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-slate-600 mb-1">Tags</div>

          <div className="flex gap-2">
            <input
              id="contactTagInput"
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
                    "contactTagInput"
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
                className="rounded bg-indigo-100 text-indigo-700 px-2 py-[2px] text-xs font-medium flex items-center gap-1"
              >
                {t}
                <button
                  className="text-indigo-700"
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
