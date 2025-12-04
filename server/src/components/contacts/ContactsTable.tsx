import { useEffect, useMemo, useState } from "react";
import { ContactsAPI } from "../../api/contacts";

interface ContactsTableProps {
  companyId?: string;
}

interface ContactRow {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
}

const displayName = (c: ContactRow) =>
  c.name || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unnamed";

export default function ContactsTable(props: ContactsTableProps) {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (props.companyId) {
        const r = await ContactsAPI.search(`company:${props.companyId}`);
        setContacts(r.data || []);
      } else {
        const r = await ContactsAPI.list();
        setContacts(r.data || []);
      }
      setLoading(false);
    };

    load();
  }, [props.companyId]);

  const runSearch = async () => {
    if (!query.trim()) return;
    const r = await ContactsAPI.search(query);
    setContacts(r.data || []);
  };

  const rows = useMemo(() => contacts ?? [], [contacts]);

  if (loading) return <div>Loading contacts…</div>;

  return (
    <div className="contacts-table space-y-4">
      <div className="search-row flex gap-2 items-center">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={query}
          placeholder="Search contacts…"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={runSearch}>
          Search
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="text-left bg-gray-50">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Company</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3">{displayName(c)}</td>
              <td className="p-3">{c.email || "—"}</td>
              <td className="p-3">{c.phone || "—"}</td>
              <td className="p-3">{c.companyName || "—"}</td>
              <td className="p-3">
                <a className="text-blue-600 hover:underline" href={`/contacts/${c.id}`}>
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
