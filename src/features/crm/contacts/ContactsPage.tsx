import React, { useState } from "react";
import ContactsTable from "./ContactsTable";
import ContactModal from "./ContactModal";
import { Contact, ContactForm } from "./types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "p1",
      firstName: "Sarah",
      lastName: "Levine",
      company: "Marshall Holdings",
      email: "slevine@marshall.com",
      phone: "555-441-2299",
      title: "Director of Finance",
      tags: ["VIP", "Strong Lead"],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const save = (data: ContactForm) => {
    if (editing) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editing.id ? { ...c, ...data, id: c.id } : c
        )
      );
    } else {
      setContacts((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...data,
        },
      ]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Contacts</h1>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded bg-indigo-600 text-white px-4 py-2 text-sm"
        >
          New Contact
        </button>
      </div>

      <ContactsTable
        contacts={contacts}
        onEdit={(c) => {
          setEditing(c);
          setModalOpen(true);
        }}
      />

      <ContactModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </div>
  );
}
