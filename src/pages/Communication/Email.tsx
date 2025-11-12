import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useEmail } from '../../hooks/useEmail';

const EmailPage = () => {
  const { listQuery, sendMutation } = useEmail();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMutation.mutate({ to, subject, body });
    setBody('');
  };

  return (
    <div className="communication-pane">
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          To
          <input value={to} onChange={(event) => setTo(event.target.value)} required />
        </label>
        <label>
          Subject
          <input value={subject} onChange={(event) => setSubject(event.target.value)} required />
        </label>
        <label>
          Message
          <textarea value={body} onChange={(event) => setBody(event.target.value)} required />
        </label>
        <Button type="submit" disabled={sendMutation.isPending}>
          Send Email
        </Button>
      </form>
      <div className="card">
        <h3>Recent Emails</h3>
        {listQuery.isLoading ? (
          <Spinner />
        ) : (
          <ul className="timeline">
            {(listQuery.data ?? []).map((email) => (
              <li key={email.id}>
                <strong>{email.subject}</strong>
                <p>{email.to}</p>
                <span>{email.sentAt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmailPage;
