import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Company, Contact, TimelineEvent } from "@/api/crm";
import { fetchCompanyContacts, fetchTimeline } from "@/api/crm";
import TimelineFeed from "@/pages/crm/timeline/TimelineFeed";

interface CompanyDetailsDrawerProps {
  company: Company | null;
  onClose: () => void;
}

const CompanyDetailsDrawer = ({ company, onClose }: CompanyDetailsDrawerProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (!company) return;
    fetchCompanyContacts(company).then(setContacts);
    fetchTimeline("company", company.id).then(setTimeline);
  }, [company]);

  if (!company) return null;

  return (
    <aside className="drawer" data-testid="company-drawer">
      <div className="drawer__header">
        <h3>{company.name}</h3>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="drawer__content">
        <Card title="Basic Info">
          <p>Industry: {company.industry}</p>
          <p>Silo: {company.silo}</p>
          <p>Owner: {company.owner}</p>
          <p>Tags: {company.tags.join(", ")}</p>
        </Card>
        <Card title="Contacts">
          {contacts.map((contact) => (
            <div key={contact.id}>{contact.name}</div>
          ))}
        </Card>
        <Card title="CRM Timeline">
          <TimelineFeed entityId={company.id} entityType="company" initialEvents={timeline} />
        </Card>
      </div>
    </aside>
  );
};

export default CompanyDetailsDrawer;
