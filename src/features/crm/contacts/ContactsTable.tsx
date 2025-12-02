import React, { useMemo, useState } from "react";
import { ContactModal, ContactForm } from "./ContactModal";

type Contact = ContactForm & { id: string };

const mockContacts: Contact[] = [
  { id: "c1", name: "Jessie Hayes", email: "jessie@northwind.ca", company: "Northwind", tags: ["Borrower", "VIP"] },
  { id: "c2", name: "Ravi Singh", email: "ravi@prairiefreight.com", company: "Prairie Freight", tags: ["Broker"] },
  { id: "c3", name: "Chen Liu", email: "chen@auroradental.ca", company: "Aurora Dental", tags: ["Borrower"] },
  { id: "c4", name: "Maria Santos", email: "maria@sproutgrocers.ca", company: "Sprout Grocers", tags: ["Partner"] },
];

export default function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [sortKey, setSortKey] = useState<keyof Omit<Contact, "tags" | "id">>("name");
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    const byQuery = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.company.toLowerCase().includes(filter.toLowerCase()) ||
        c.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())),
    );
    const normalize = (val: string | string[]) => (Array.isArray(val) ? val.join(", ") : val);
    return [...byQuery].sort((a, b) => normalize(a[sortKey]).localeCompare(normalize(b[sortKey])));
  }, [contacts, filter, sortKey]);

  const handleSave = (contact: ContactForm) => {
    if (contact.id) {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? (contact as Contact) : c)));
    } else {
      setContacts((prev) => [...prev, { ...(contact as ContactForm), id: crypto.randomUUID() }]);
    }
  };

  const openForEdit = (contact: Contact) => {
    setEditing(contact);
    setModalOpen(true);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Contacts</h3>
          <p className="text-sm text-slate-600">Manage borrower and broker contacts locally.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Filter by name, company, tag"
            className="h-10 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Add contact
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {(["name", "email", "company"] as (keyof Omit<Contact, "tags" | "id">)[]).map((key) => (
                <th
                  key={key}
                  className="cursor-pointer px-4 py-2 text-left font-semibold text-slate-700"
                  onClick={() => setSortKey(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortKey === key && <span className="text-indigo-600"> ↑</span>}
                </th>
              ))}
              <th className="px-4 py-2 text-left font-semibold text-slate-700">Tags</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{contact.name}</td>
                <td className="px-4 py-3 text-slate-700">{contact.email}</td>
                <td className="px-4 py-3 text-slate-700">{contact.company}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-semibold text-indigo-600" onClick={() => openForEdit(contact)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
    </div>
  );
}
