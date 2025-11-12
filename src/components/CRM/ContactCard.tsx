import type { CRMContact } from '../../types/crm';

interface ContactCardProps {
  contact: CRMContact;
  onAssign?: (contactId: string) => void;
}

export function ContactCard({ contact, onAssign }: ContactCardProps) {
  const statusTone = contact.status === 'active' ? 'success' : contact.status === 'inactive' ? 'muted' : 'warning';

  return (
    <article className="card contact-card" data-silo={contact.silo}>
      <header className="contact-card__header">
        <div>
          <h3>{contact.name}</h3>
          {contact.company && <span className="contact-card__company">{contact.company}</span>}
        </div>
        <span className={`contact-card__status contact-card__status--${statusTone}`}>{contact.status}</span>
      </header>
      <dl className="contact-card__meta">
        {contact.title && (
          <div>
            <dt>Title</dt>
            <dd>{contact.title}</dd>
          </div>
        )}
        {contact.email && (
          <div>
            <dt>Email</dt>
            <dd>{contact.email}</dd>
          </div>
        )}
        {contact.phone && (
          <div>
            <dt>Phone</dt>
            <dd>{contact.phone}</dd>
          </div>
        )}
        <div>
          <dt>Owner</dt>
          <dd>{contact.owner ?? 'Unassigned'}</dd>
        </div>
        <div>
          <dt>Pipeline Stage</dt>
          <dd>{contact.stage}</dd>
        </div>
        {contact.tags && contact.tags.length > 0 && (
          <div className="contact-card__tags">
            <dt>Tags</dt>
            <dd>
              {contact.tags.map((tag) => (
                <span key={tag} className="contact-card__tag">
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <footer className="contact-card__footer">
        <div className="contact-card__timestamps">
          <span>Last touch: {contact.lastInteractionAt ? new Date(contact.lastInteractionAt).toLocaleString() : '—'}</span>
          <span>Next follow-up: {contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt).toLocaleString() : '—'}</span>
        </div>
        {onAssign && (
          <button className="btn" onClick={() => onAssign(contact.id)} type="button">
            Reassign
          </button>
        )}
      </footer>
    </article>
  );
}
