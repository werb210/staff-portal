import { useMemo, useState } from "react";
import { Button } from "../../components/common/Button";
import { Drawer } from "../../components/common/Drawer";
import { Spinner } from "../../components/common/Spinner";
import { Table } from "../../components/common/Table";

import { useContacts, type Contact } from "../../hooks/useContacts";
import ContactDrawer from "./ContactDrawer";

const ContactsPage = () => {
  const { listQuery } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const columns = useMemo(
    () => [
      { header: "Name", accessor: "name" as const },
      { header: "Email", accessor: "email" as const },
      { header: "Phone", accessor: "phone" as const },
      { header: "Status", accessor: "status" as const },
    ],
    []
  );

  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h2>Contacts</h2>
          <p>Manage borrower and partner relationships.</p>
        </div>

        <Button
          onClick={() =>
            setSelectedContact({
              id: "new",
              name: "",
              email: "",
              phone: "",
              company: "",
              status: "",
            })
          }
        >
          New Contact
        </Button>
      </header>

      {listQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="card">
          <Table
            data={listQuery.data ?? []}
            columns={columns}
            keySelector={(contact) => contact.id}
            emptyMessage="No contacts found."
            onRowClick={(contact) => handleSelect(contact)}
          />
        </div>
      )}

      <Drawer
        title={
          selectedContact?.id === "new"
            ? "Create Contact"
            : selectedContact?.name ?? ""
        }
        open={Boolean(selectedContact)}
        onClose={() => setSelectedContact(null)}
        width={520}
      >
        {selectedContact && (
          <ContactDrawer
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
          />
        )}
      </Drawer>
    </section>
  );
};

export default ContactsPage;
