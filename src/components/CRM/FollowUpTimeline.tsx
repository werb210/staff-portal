import { useState } from 'react';
import type { CRMReminder } from '../../types/crm';

interface FollowUpTimelineProps {
  reminders: CRMReminder[];
  onSchedule: (payload: { contactId: string; scheduledFor: string; channel: 'sms' | 'email' | 'call'; notes?: string }) => void;
  isScheduling?: boolean;
}

type FollowUpFormState = {
  contactId: string;
  scheduledFor: string;
  channel: 'sms' | 'email' | 'call';
  notes: string;
};

const INITIAL_FORM_STATE: FollowUpFormState = {
  contactId: '',
  scheduledFor: '',
  channel: 'email',
  notes: '',
};

export function FollowUpTimeline({ reminders, onSchedule, isScheduling }: FollowUpTimelineProps) {
  const [formState, setFormState] = useState<FollowUpFormState>(INITIAL_FORM_STATE);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.contactId || !formState.scheduledFor) return;
    onSchedule(formState);
    setFormState((prev) => ({ ...prev, notes: '' }));
  };

  return (
    <div className="follow-up">
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Contact ID
          <input
            name="contactId"
            value={formState.contactId}
            onChange={(event) => setFormState((prev) => ({ ...prev, contactId: event.target.value }))}
            placeholder="crm-contact-123"
            required
          />
        </label>
        <label>
          Follow-up time
          <input
            type="datetime-local"
            name="scheduledFor"
            value={formState.scheduledFor}
            onChange={(event) => setFormState((prev) => ({ ...prev, scheduledFor: event.target.value }))}
            required
          />
        </label>
        <label>
          Channel
          <select
            name="channel"
            value={formState.channel}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, channel: event.target.value as FollowUpFormState['channel'] }))
            }
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="call">Call</option>
          </select>
        </label>
        <label className="grid-full">
          Notes
          <textarea
            name="notes"
            placeholder="Add context for the follow-up"
            value={formState.notes}
            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </label>
        <button className="btn primary" disabled={isScheduling} type="submit">
          {isScheduling ? 'Scheduling…' : 'Schedule follow-up'}
        </button>
      </form>

      <ol className="follow-up__timeline">
        {reminders.length === 0 && <li className="empty-state">No follow-ups scheduled.</li>}
        {reminders.map((reminder) => (
          <li key={reminder.id} className="follow-up__item" data-silo={reminder.silo}>
            <div>
              <strong>{new Date(reminder.scheduledFor).toLocaleString()}</strong>
              <span className="follow-up__channel">via {reminder.channel.toUpperCase()}</span>
            </div>
            <p>{reminder.notes ?? 'Reminder scheduled without notes.'}</p>
            <small>Contact {reminder.contactId}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}
