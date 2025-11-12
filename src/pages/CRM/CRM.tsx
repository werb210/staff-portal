import { useState } from 'react';
import { ContactCard } from '../../components/CRM/ContactCard';
import { Spinner } from '../../components/common/Spinner';
import {
  useContacts,
  useContactDetails,
  useContactTimeline,
  type Contact,
} from '../../hooks/useContacts';

const CRM = () => {
  const { listQuery } = useContacts();
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const detailQuery = useContactDetails(activeContactId);
  const timelineQuery = useContactTimeline(activeContactId);

  const contacts: Contact[] = listQuery.data ?? [];
  const activeContact = detailQuery.data ?? contacts.find((contact) => contact.id === activeContactId) ?? null;

  return (
    <section className="page crm">
      <header className="page-header">
        <div>
          <h2>CRM</h2>
          <p>Track relationship history and keep borrower conversations organized.</p>
        </div>
        <span>{contacts.length} total contacts</span>
      </header>
      <div className="grid two-columns">
        <div className="card">
          <h3>Contact Directory</h3>
          {listQuery.isLoading ? (
            <Spinner />
          ) : contacts.length === 0 ? (
            <p className="empty-state">No contacts yet. Create a record from the Contacts page.</p>
          ) : (
            <div className="crm__contact-grid">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onSelect={setActiveContactId}
                  isActive={activeContactId === contact.id}
                />
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h3>Relationship Timeline</h3>
          {!activeContactId ? (
            <p>Select a contact to see their profile and recent activity.</p>
          ) : detailQuery.isLoading || timelineQuery.isLoading ? (
            <Spinner />
          ) : activeContact ? (
            <div className="crm__contact-detail">
              <dl>
                <dt>Name</dt>
                <dd>{activeContact.name}</dd>
                {activeContact.company && (
                  <>
                    <dt>Company</dt>
                    <dd>{activeContact.company}</dd>
                  </>
                )}
                {activeContact.email && (
                  <>
                    <dt>Email</dt>
                    <dd>{activeContact.email}</dd>
                  </>
                )}
                {activeContact.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>{activeContact.phone}</dd>
                  </>
                )}
                <dt>Status</dt>
                <dd>{activeContact.status ?? 'prospect'}</dd>
              </dl>
              <h4>Activity</h4>
              <ul className="timeline">
                {(timelineQuery.data ?? []).map((entry, index) => (
                  <li key={`${activeContact.id}-timeline-${index}`}>{entry}</li>
                ))}
                {(timelineQuery.data ?? []).length === 0 && <li>No recent activity logged.</li>}
              </ul>
            </div>
          ) : (
            <p>Unable to load contact details. Please try selecting another contact.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CRM;
