import { useEffect, useState } from "react";
import { fetchContacts } from "@/lib/api/contacts";

type Contact = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
};

export default function ContactsPage() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchContacts();
        if (!cancelled) {
          setRows(
            (data as any[]).map((c) => ({
              id: c.id ?? c.contactId ?? String(Math.random()),
              name: c.name ?? c.fullName ?? "",
              email: c.email ?? "",
              phone: c.phone ?? c.mobile ?? "",
              companyName: c.companyName ?? c.company ?? ""
            }))
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load contacts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bf-page">
      <h1 className="bf-page-title">Contacts</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="bf-error">{error}</div>}
      {!loading && !error && (
        <table className="bf-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.companyName}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
