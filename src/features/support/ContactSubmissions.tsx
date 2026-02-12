import { useEffect, useState } from "react";

type ContactSubmission = {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ContactSubmissionsProps = {
  isAdmin: boolean;
};

export function ContactSubmissions({ isAdmin }: ContactSubmissionsProps) {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);

  async function load() {
    const res = await fetch("/api/support/contacts");
    const data = (await res.json()) as ContactSubmission[];
    setContacts(data);
  }

  useEffect(() => {
    if (!isAdmin) return;
    void load();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Website Contact Leads</h2>
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded border border-slate-200 p-3">
            <strong>{contact.company}</strong>
            <p>
              {contact.firstName} {contact.lastName}
            </p>
            <p>{contact.email}</p>
            <p>{contact.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
