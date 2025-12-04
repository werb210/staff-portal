import { useEffect, useState } from "react";
import { ContactsAPI } from "../../api/contacts";

interface ContactEditorProps {
  contact: any;
}

export default function ContactEditor({ contact }: ContactEditorProps) {
  const [form, setForm] = useState<any>(contact);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(contact);
  }, [contact]);

  const update = async () => {
    const res = await ContactsAPI.update(contact.id, form);
    setForm(res.data ?? form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="contact-editor flex flex-col gap-3 max-w-xl">
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

      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={update}>
        Save
      </button>
      {saved && <div className="saved-banner text-green-700">Saved!</div>}
    </div>
  );
}
