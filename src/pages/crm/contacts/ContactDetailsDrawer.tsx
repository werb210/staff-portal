import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { Contact, Company, TimelineEvent } from "@/api/crm";
import { createNote, fetchApplications, fetchContactCompanies, fetchTimeline } from "@/api/crm";
import VoiceDialer from "@/components/dialer/VoiceDialer";
import IncomingCallToast from "@/components/dialer/IncomingCallToast";
import SMSComposer from "@/components/sms/SMSComposer";
import EmailViewer from "@/components/email/EmailViewer";
import TimelineFeed from "@/pages/crm/timeline/TimelineFeed";

interface ContactDetailsDrawerProps {
  contact: Contact | null;
  onClose: () => void;
}

const ContactDetailsDrawer = ({ contact, onClose }: ContactDetailsDrawerProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<{ id: string; stage: string }[]>([]);
  const [note, setNote] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showDialer, setShowDialer] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [incoming, setIncoming] = useState<string | null>(null);

  useEffect(() => {
    if (!contact) return;
    let isActive = true;

    fetchContactCompanies(contact).then((result) => {
      if (isActive) setCompanies(result);
    });
    fetchApplications(contact.id).then((result) => {
      if (isActive) setApplications(result);
    });
    fetchTimeline("contact", contact.id).then((result) => {
      if (isActive) setTimeline(result);
    });

    return () => {
      isActive = false;
    };
  }, [contact]);

  if (!contact) return null;

  const handleAddNote = async () => {
    if (!note) return;
    const created = await createNote(contact.id, note);
    setTimeline((current) => [created, ...current]);
    setNote("");
  };

  return (
    <aside className="drawer" data-testid="contact-drawer">
      <div className="drawer__header">
        <h3>{contact.name}</h3>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="drawer__content">
        <Card title="Basic Info">
          <p>Email: {contact.email}</p>
          <p>Phone: {contact.phone}</p>
          <p>Silo: {contact.silo}</p>
          <p>Owner: {contact.owner}</p>
          <p>Tags: {contact.tags.join(", ")}</p>
        </Card>
        <Card title="Associated Companies">
          {companies.map((company) => (
            <div key={company.id}>{company.name}</div>
          ))}
        </Card>
        <Card title="Linked Applications">
          {applications.map((app) => (
            <div key={app.id}>{app.id} — {app.stage}</div>
          ))}
        </Card>
        <div className="flex gap-2 my-2">
          <Button onClick={() => setShowDialer(true)}>Call</Button>
          <Button onClick={() => setShowSms(true)}>SMS</Button>
          <Button onClick={() => setShowEmail(true)}>Email</Button>
          <Button variant="secondary" onClick={() => setIncoming(contact.phone)}>
            Simulate Incoming
          </Button>
        </div>
        <Card title="Add Note">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add internal note"
            className="w-full border rounded p-2"
          />
          <Button onClick={handleAddNote} className="mt-2">
            Save Note
          </Button>
        </Card>
        <Card title="CRM Timeline">
          <TimelineFeed entityId={contact.id} entityType="contact" initialEvents={timeline} />
        </Card>
      </div>
      {incoming && (
        <IncomingCallToast
          from={incoming}
          onAccept={() => setShowDialer(true)}
          onViewRecord={() => undefined}
          onDismiss={() => setIncoming(null)}
        />
      )}
      <VoiceDialer
        visible={showDialer}
        contact={contact}
        onClose={() => setShowDialer(false)}
        onCallLogged={(summary) =>
          setTimeline((current) => [
            {
              id: `call-${Date.now()}`,
              entityId: contact.id,
              entityType: "contact",
              type: "call",
              direction: "outbound",
              occurredAt: new Date().toISOString(),
              summary
            },
            ...current
          ])
        }
      />
      <SMSComposer visible={showSms} contact={contact} onClose={() => setShowSms(false)} />
      <EmailViewer visible={showEmail} contactId={contact.id} onClose={() => setShowEmail(false)} />
    </aside>
  );
};

export default ContactDetailsDrawer;
