import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ContactRow from "./ContactRow";
import ContactDetailsDrawer from "./ContactDetailsDrawer";
import ContactForm from "./ContactForm";
import { fetchContacts } from "@/api/crm";
import type { Contact } from "@/api/crm";
import { useCrmStore } from "@/state/crm.store";

const owners = ["Alex", "Taylor"];

const ContactsPage = () => {
  const { silo, setSilo, filters, setFilters, resetFilters } = useCrmStore();
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts", silo, filters], queryFn: fetchContacts });

  const filtered = useMemo(() => contacts, [contacts]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: event.target.value });
  };

  return (
    <div className="page" data-testid="contacts-page">
      <Card
        title="Contacts"
        actions={
          <div className="flex gap-2">
            <Select value={silo} onChange={(e) => setSilo(e.target.value as any)}>
              <option value="BF">BF</option>
              <option value="BI">BI</option>
              <option value="SLF">SLF</option>
            </Select>
            <Button onClick={() => setShowForm(true)}>Add Contact</Button>
          </div>
        }
      >
        <div className="flex gap-2 mb-2 items-center">
          <Input placeholder="Search" value={filters.search} onChange={handleSearch} />
          <Select
            value={filters.owner ?? ""}
            onChange={(e) => setFilters({ owner: e.target.value || null })}
            data-testid="owner-filter"
          >
            <option value="">All owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasActiveApplication}
              onChange={(e) => setFilters({ hasActiveApplication: e.target.checked })}
            />
            Has active applications
          </label>
          <Button variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
        </div>
        <Table headers={["Name", "Email", "Phone", "Silo", "Owner", "Active", "Actions"]}>
          {filtered.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              onSelect={setSelected}
              onCall={() => setSelected(contact)}
            />
          ))}
        </Table>
      </Card>
      {showForm && (
        <Card title="New Contact" actions={<Button onClick={() => setShowForm(false)}>Close</Button>}>
          <ContactForm onSave={() => setShowForm(false)} />
        </Card>
      )}
      <ContactDetailsDrawer contact={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ContactsPage;
