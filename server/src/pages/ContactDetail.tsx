import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ContactsAPI } from "../api/contacts";
import ContactEditor from "../components/contacts/ContactEditor";
import MainLayout from "../layout/MainLayout";

export default function ContactDetail() {
  const { id } = useParams();
  const [contact, setContact] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    ContactsAPI.get(id).then((r) => setContact(r.data));
  }, [id]);

  if (!contact) return <div>Loading…</div>;

  return (
    <MainLayout>
      <div className="contact-detail space-y-4">
        <h1 className="text-2xl font-semibold">{contact.name}</h1>
        <ContactEditor contact={contact} />
      </div>
    </MainLayout>
  );
}
