import { useEffect, useState } from "react";
import { fetchContacts } from "@/lib/api/contacts";

export default function ContactsPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchContacts().then(setList).catch(console.error);
  }, []);

  return (
    <>
      <h1>Contacts</h1>
      <ul>
        {list.map((c) => (
          <li key={c.id}>{c.firstName} {c.lastName}</li>
        ))}
      </ul>
    </>
  );
}
