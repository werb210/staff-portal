import type { KeyboardEvent } from 'react';
import type { Contact } from '../../api/contacts';

interface ContactCardProps {
  contact: Contact & {
    owner?: string | null;
    stage?: string | null;
    tags?: string[] | null;
    lastInteractionAt?: string | null;
    nextFollowUpAt?: string | null;
  };
  onAssign?: (contactId: string) => void;
  onSelect?: (contactId: string) => void;
  isActive?: boolean;
}

const resolveStatusTone = (status?: string | null) => {
  if (!status) return 'warning';
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'success';
  if (normalized === 'inactive') return 'muted';
  return 'warning';
};

export function ContactCard({ contact, onAssign, onSelect, isActive }: ContactCardProps) {
  const statusTone = resolveStatusTone(contact.status);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(contact.id);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onSelect) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(contact.id);
    }
  };

  return (
    <article
      className={`card contact-card${isActive ? ' contact-card--active' : ''}`}
      onClick={handleSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <header className="contact-card__header">
        <div>
          <h3>{contact.name}</h3>
          {contact.company && <span className="contact-card__company">{contact.company}</span>}
        </div>
        <span className={`contact-card__status contact-card__status--${statusTone}`}>{contact.status}</span>
      </header>
      <dl className="contact-card__meta">
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
        {contact.owner && (
          <div>
            <dt>Owner</dt>
            <dd>{contact.owner}</dd>
          </div>
        )}
        {contact.stage && (
          <div>
            <dt>Pipeline Stage</dt>
            <dd>{contact.stage}</dd>
          </div>
        )}
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
        {(contact.lastInteractionAt || contact.nextFollowUpAt) && (
          <div className="contact-card__timestamps">
            <span>
              Last touch:{' '}
              {contact.lastInteractionAt ? new Date(contact.lastInteractionAt).toLocaleString() : '—'}
            </span>
            <span>
              Next follow-up:{' '}
              {contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt).toLocaleString() : '—'}
            </span>
          </div>
        )}
        {onAssign && (
          <button className="btn" onClick={() => onAssign(contact.id)} type="button">
            Reassign
          </button>
        )}
      </footer>
    </article>
  );
}
