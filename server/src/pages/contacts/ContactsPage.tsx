import { useEffect, useState } from "react";
import { listContacts, createContact, Contact } from "@/api/contacts";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await listContacts();
    setContacts(data);
    setLoading(false);
  }

  async function submit() {
    await createContact(form);
    setShowCreate(false);
    load();
  }

  return (
    <div>
      <h1>Contacts</h1>

      <button onClick={() => setShowCreate(true)}>Add Contact</button>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <div className="modal">
          <h2>Create Contact</h2>
          <input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button onClick={submit}>Save</button>
          <button onClick={() => setShowCreate(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
