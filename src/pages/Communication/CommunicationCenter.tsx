import { useState } from 'react';
import { useSendSMS, useSendEmail, useLogCall } from '../../hooks/api/useCommunication';
import type { SMSPayload, EmailPayload, CallPayload } from '../../types/communication';

export default function CommunicationCenter() {
  const smsMutation = useSendSMS();
  const emailMutation = useSendEmail();
  const callMutation = useLogCall();
  const [sms, setSms] = useState<SMSPayload>({ to: '', message: '' });
  const [email, setEmail] = useState<EmailPayload>({ to: '', subject: '', body: '' });
  const [call, setCall] = useState<CallPayload>({ to: '', notes: '' });

  const handleSMS = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    smsMutation.mutate(sms);
    setSms({ to: '', message: '' });
  };

  const handleEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    emailMutation.mutate(email);
    setEmail({ to: '', subject: '', body: '' });
  };

  const handleCall = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    callMutation.mutate(call);
    setCall({ to: '', notes: '' });
  };

  return (
    <div className="page communication">
      <section className="card">
        <header className="card__header">
          <h2>Send SMS</h2>
        </header>
        <form className="form-grid" onSubmit={handleSMS}>
          <label>
            Recipient
            <input value={sms.to} onChange={(event) => setSms((prev) => ({ ...prev, to: event.target.value }))} required />
          </label>
          <label>
            Application ID (optional)
            <input
              value={sms.applicationId ?? ''}
              onChange={(event) => setSms((prev) => ({ ...prev, applicationId: event.target.value }))}
              placeholder="APP-123"
            />
          </label>
          <label className="grid-full">
            Message
            <textarea
              value={sms.message}
              onChange={(event) => setSms((prev) => ({ ...prev, message: event.target.value }))}
              rows={4}
              required
            />
          </label>
          <button type="submit" className="btn primary" disabled={smsMutation.isPending}>
            {smsMutation.isPending ? 'Sending...' : 'Send SMS'}
          </button>
        </form>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Send Email</h2>
        </header>
        <form className="form-grid" onSubmit={handleEmail}>
          <label>
            Recipient
            <input value={email.to} onChange={(event) => setEmail((prev) => ({ ...prev, to: event.target.value }))} required />
          </label>
          <label>
            Application ID (optional)
            <input
              value={email.applicationId ?? ''}
              onChange={(event) => setEmail((prev) => ({ ...prev, applicationId: event.target.value }))}
            />
          </label>
          <label>
            Subject
            <input value={email.subject} onChange={(event) => setEmail((prev) => ({ ...prev, subject: event.target.value }))} required />
          </label>
          <label className="grid-full">
            Body
            <textarea
              value={email.body}
              onChange={(event) => setEmail((prev) => ({ ...prev, body: event.target.value }))}
              rows={5}
              required
            />
          </label>
          <button type="submit" className="btn" disabled={emailMutation.isPending}>
            {emailMutation.isPending ? 'Sending...' : 'Send Email'}
          </button>
        </form>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Log Call</h2>
        </header>
        <form className="form-grid" onSubmit={handleCall}>
          <label>
            Recipient
            <input value={call.to} onChange={(event) => setCall((prev) => ({ ...prev, to: event.target.value }))} required />
          </label>
          <label>
            Application ID (optional)
            <input value={call.applicationId ?? ''} onChange={(event) => setCall((prev) => ({ ...prev, applicationId: event.target.value }))} />
          </label>
          <label>
            Outcome
            <input value={call.outcome ?? ''} onChange={(event) => setCall((prev) => ({ ...prev, outcome: event.target.value }))} />
          </label>
          <label>
            Duration (minutes)
            <input
              type="number"
              value={call.duration ?? ''}
              onChange={(event) =>
                setCall((prev) => ({
                  ...prev,
                  duration: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            />
          </label>
          <label className="grid-full">
            Notes
            <textarea value={call.notes ?? ''} onChange={(event) => setCall((prev) => ({ ...prev, notes: event.target.value }))} rows={3} />
          </label>
          <button type="submit" className="btn" disabled={callMutation.isPending}>
            {callMutation.isPending ? 'Saving...' : 'Log Call'}
          </button>
        </form>
      </section>
    </div>
  );
}
